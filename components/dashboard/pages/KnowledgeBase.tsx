"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import type {
  CrawlCategory,
  DocumentExtraction,
  DocumentUpload,
  KnowledgeExtraction,
  KnowledgeSource,
  WebsiteCrawlJobDetail,
  WorkspaceSettings
} from "@/lib/auth-api";
import {
  createWebsiteCrawl,
  createWebPageScrape,
  deleteDocument,
  deleteWebPage,
  getDocumentExtraction,
  getKnowledgeExtraction,
  getWebsiteCrawl,
  listCrawlCategories,
  listDocuments,
  listWebPages,
  queueWebsiteCrawlPages,
  updateWebsiteCrawlSchedule,
  updateDocumentExtraction,
  updateKnowledgeExtraction,
  uploadDocument
} from "@/lib/auth-api";
import type { KnowledgeSelection } from "@/components/dashboard/types";
import { Card, PageIntro } from "@/components/dashboard/shared";
import {
  documentIcon,
  extractionDetail,
  extractionStatusClass,
  extractionStatusLabel,
  formatBytes,
  formatDate,
  isExtractionActive,
  webPageDetail
} from "@/components/dashboard/utils";

export function KnowledgeBase({ settings }: { settings: WorkspaceSettings }) {
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [webPages, setWebPages] = useState<KnowledgeSource[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isLoadingWebPages, setIsLoadingWebPages] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isQueueingCrawl, setIsQueueingCrawl] = useState(false);
  const [webUrl, setWebUrl] = useState("");
  const [webWaitSeconds, setWebWaitSeconds] = useState(2);
  const [crawlUrl, setCrawlUrl] = useState("");
  const [crawlCategories, setCrawlCategories] = useState<CrawlCategory[]>([]);
  const [selectedCrawlCategories, setSelectedCrawlCategories] = useState<Set<string>>(new Set(["policy", "customer_support", "docs_guides"]));
  const [crawlPrompt, setCrawlPrompt] = useState("");
  const [activeCrawl, setActiveCrawl] = useState<WebsiteCrawlJobDetail | null>(null);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
  const [manualCrawlUrl, setManualCrawlUrl] = useState("");
  const [manualCrawlUrls, setManualCrawlUrls] = useState<string[]>([]);
  const [recrawlEnabled, setRecrawlEnabled] = useState(false);
  const [recrawlIntervalDays, setRecrawlIntervalDays] = useState(14);
  const [uploadError, setUploadError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedItem, setSelectedItem] = useState<KnowledgeSelection | null>(null);
  const [selectedExtraction, setSelectedExtraction] = useState<DocumentExtraction | KnowledgeExtraction | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isLoadingExtraction, setIsLoadingExtraction] = useState(false);
  const [isSavingExtraction, setIsSavingExtraction] = useState(false);

  useEffect(() => {
    setIsLoadingDocs(true);
    setIsLoadingWebPages(true);
    setUploadError("");
    listDocuments(settings.company.id)
      .then(setDocuments)
      .catch((error) => setUploadError(error instanceof Error ? error.message : "Could not load documents."))
      .finally(() => setIsLoadingDocs(false));
    listWebPages(settings.company.id)
      .then(setWebPages)
      .catch((error) => setUploadError(error instanceof Error ? error.message : "Could not load scraped pages."))
      .finally(() => setIsLoadingWebPages(false));
    listCrawlCategories()
      .then((categories) => {
        setCrawlCategories(categories);
        setSelectedCrawlCategories((existing) => existing.size ? existing : new Set(categories.slice(0, 3).map((category) => category.id)));
      })
      .catch((error) => setUploadError(error instanceof Error ? error.message : "Could not load crawl categories."));
  }, [settings.company.id]);

  useEffect(() => {
    const hasActiveExtraction = documents.some((document) => isExtractionActive(document.extraction_status))
      || webPages.some((page) => isExtractionActive(page.status));
    if (!hasActiveExtraction) return;

    const intervalId = window.setInterval(() => {
      listDocuments(settings.company.id)
        .then(setDocuments)
        .catch((error) => setUploadError(error instanceof Error ? error.message : "Could not refresh document status."));
      listWebPages(settings.company.id)
        .then(setWebPages)
        .catch((error) => setUploadError(error instanceof Error ? error.message : "Could not refresh web scrape status."));
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [documents, webPages, settings.company.id]);

  useEffect(() => {
    if (!activeCrawl || !["queued", "processing"].includes(activeCrawl.status)) return;

    const intervalId = window.setInterval(() => {
      getWebsiteCrawl(activeCrawl.id, settings.company.id)
        .then((crawl) => {
          setActiveCrawl(crawl);
          if (crawl.status === "completed") {
            setSelectedCandidateIds(new Set(crawl.candidates.map((candidate) => candidate.id)));
            setRecrawlEnabled(crawl.recrawl_enabled);
            setRecrawlIntervalDays(crawl.recrawl_interval_days ?? 14);
          }
        })
        .catch((error) => setUploadError(error instanceof Error ? error.message : "Could not refresh crawl status."));
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [activeCrawl, settings.company.id]);

  function toggleCrawlCategory(categoryId: string) {
    setSelectedCrawlCategories((existing) => {
      const next = new Set(existing);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }

  function toggleCandidate(candidateId: string) {
    setSelectedCandidateIds((existing) => {
      const next = new Set(existing);
      if (next.has(candidateId)) {
        next.delete(candidateId);
      } else {
        next.add(candidateId);
      }
      return next;
    });
  }

  async function startWebsiteDiscovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!crawlUrl.trim()) return;

    setIsDiscovering(true);
    setUploadError("");
    setNotice("");
    setActiveCrawl(null);
    setSelectedCandidateIds(new Set());
    setManualCrawlUrls([]);
    try {
      const crawl = await createWebsiteCrawl({
        root_url: crawlUrl.trim(),
        selected_categories: Array.from(selectedCrawlCategories),
        custom_prompt: crawlPrompt.trim(),
        max_depth: 5,
        max_pages: 300
      }, settings.company.id);
      setActiveCrawl(crawl);
      setNotice("Website discovery queued. Candidates will appear here shortly.");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not start website discovery.");
    } finally {
      setIsDiscovering(false);
    }
  }

  function addManualCrawlUrl() {
    const url = manualCrawlUrl.trim();
    if (!url) return;
    setManualCrawlUrls((existing) => existing.includes(url) ? existing : [...existing, url]);
    setManualCrawlUrl("");
  }

  function crawlStatusLabel(status: string) {
    if (status === "queued") return "Queued";
    if (status === "processing") return "Processing";
    if (status === "completed") return "Ready";
    if (status === "failed") return "Failed";
    return "Pending";
  }

  function crawlStatusClass(status: string) {
    if (status === "completed") return "ready";
    if (status === "failed") return "failed";
    if (status === "processing") return "processing";
    return "queued";
  }

  async function queueSelectedCrawlPages() {
    if (!activeCrawl) return;
    setIsQueueingCrawl(true);
    setUploadError("");
    setNotice("");
    try {
      const queued = await queueWebsiteCrawlPages(activeCrawl.id, {
        selected_candidate_ids: Array.from(selectedCandidateIds),
        manual_urls: manualCrawlUrls,
        wait_seconds: webWaitSeconds
      }, settings.company.id);
      setWebPages((existing) => [...queued, ...existing]);
      setNotice(`${queued.length} page${queued.length === 1 ? "" : "s"} queued for scraping.`);
      const refreshed = await getWebsiteCrawl(activeCrawl.id, settings.company.id);
      setActiveCrawl(refreshed);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not queue selected pages.");
    } finally {
      setIsQueueingCrawl(false);
    }
  }

  async function saveRecrawlSchedule() {
    if (!activeCrawl) return;
    setUploadError("");
    setNotice("");
    try {
      const updated = await updateWebsiteCrawlSchedule(activeCrawl.id, {
        recrawl_enabled: recrawlEnabled,
        recrawl_interval_days: recrawlEnabled ? recrawlIntervalDays : null
      }, settings.company.id);
      setActiveCrawl((existing) => existing ? { ...existing, ...updated } : existing);
      setNotice(recrawlEnabled ? "Re-crawl schedule saved." : "Re-crawl schedule disabled.");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not update re-crawl schedule.");
    }
  }

  async function handleDocumentUpload(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selected.length) return;

    setIsUploading(true);
    setUploadError("");
    setNotice("");
    try {
      const uploaded: DocumentUpload[] = [];
      for (const file of selected) {
        uploaded.push(await uploadDocument(file, settings.company.id));
      }
      setDocuments((existing) => [...uploaded, ...existing]);
      setNotice(`${uploaded.length} document${uploaded.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function removeDocument(uploadId: string) {
    setUploadError("");
    setNotice("");
    try {
      await deleteDocument(uploadId, settings.company.id);
      setDocuments((existing) => existing.filter((document) => document.id !== uploadId));
      if (selectedItem?.kind === "document" && selectedItem.id === uploadId) {
        setSelectedItem(null);
        setSelectedExtraction(null);
        setExtractedText("");
      }
      setNotice("Document removed.");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not remove document.");
    }
  }

  async function handleWebScrapeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!webUrl.trim()) return;

    setIsScraping(true);
    setUploadError("");
    setNotice("");
    try {
      const page = await createWebPageScrape(webUrl.trim(), webWaitSeconds, settings.company.id);
      setWebPages((existing) => [page, ...existing]);
      setWebUrl("");
      setNotice("Web page scrape queued.");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not queue web page scrape.");
    } finally {
      setIsScraping(false);
    }
  }

  async function removeWebPage(knowledgeDocumentId: string) {
    setUploadError("");
    setNotice("");
    try {
      await deleteWebPage(knowledgeDocumentId, settings.company.id);
      setWebPages((existing) => existing.filter((page) => page.id !== knowledgeDocumentId));
      if (selectedItem?.kind === "web_page" && selectedItem.id === knowledgeDocumentId) {
        setSelectedItem(null);
        setSelectedExtraction(null);
        setExtractedText("");
      }
      setNotice("Web page source removed.");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not remove web page source.");
    }
  }

  async function openExtraction(document: DocumentUpload) {
    setSelectedItem({
      kind: "document",
      id: document.id,
      title: document.original_filename,
      status: document.extraction_status,
      detail: extractionDetail(document)
    });
    setSelectedExtraction(null);
    setExtractedText("");
    setIsLoadingExtraction(true);
    setUploadError("");
    setNotice("");
    try {
      const extraction = await getDocumentExtraction(document.id, settings.company.id);
      setSelectedExtraction(extraction);
      setExtractedText(extraction.extracted_text);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not load extracted text.");
    } finally {
      setIsLoadingExtraction(false);
    }
  }

  async function openWebExtraction(page: KnowledgeSource) {
    setSelectedItem({
      kind: "web_page",
      id: page.id,
      title: page.source_title || page.source_url,
      status: page.status,
      detail: webPageDetail(page)
    });
    setSelectedExtraction(null);
    setExtractedText("");
    setIsLoadingExtraction(true);
    setUploadError("");
    setNotice("");
    try {
      const extraction = await getKnowledgeExtraction(page.id, settings.company.id);
      setSelectedExtraction(extraction);
      setExtractedText(extraction.extracted_text);
      setSelectedItem({
        kind: "web_page",
        id: page.id,
        title: extraction.source_title || extraction.source_url,
        status: extraction.status,
        detail: webPageDetail(extraction)
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not load scraped text.");
    } finally {
      setIsLoadingExtraction(false);
    }
  }

  function closeExtraction() {
    setSelectedItem(null);
    setSelectedExtraction(null);
    setExtractedText("");
    setIsLoadingExtraction(false);
  }

  async function saveExtraction() {
    if (!selectedItem) return;
    setIsSavingExtraction(true);
    setUploadError("");
    setNotice("");
    try {
      const extraction = selectedItem.kind === "document"
        ? await updateDocumentExtraction(selectedItem.id, extractedText, settings.company.id)
        : await updateKnowledgeExtraction(selectedItem.id, extractedText, settings.company.id);
      setSelectedExtraction(extraction);
      setExtractedText(extraction.extracted_text);
      if (selectedItem.kind === "document") {
        setDocuments((existing) => existing.map((document) => document.id === selectedItem.id ? {
          ...document,
          extraction_status: extraction.status,
          extracted_char_count: extraction.char_count,
          extraction_error: extraction.error_message || null
        } : document));
      } else {
        setWebPages((existing) => existing.map((page) => page.id === selectedItem.id ? {
          ...page,
          status: extraction.status,
          char_count: extraction.char_count,
          error_message: extraction.error_message,
          source_title: "source_title" in extraction ? extraction.source_title : page.source_title,
          source_url: "source_url" in extraction ? extraction.source_url : page.source_url
        } : page));
      }
      setSelectedItem({
        ...selectedItem,
        status: extraction.status,
        detail: `${extraction.char_count.toLocaleString()} extracted character${extraction.char_count === 1 ? "" : "s"}`,
        title: "source_title" in extraction ? extraction.source_title : selectedItem.title
      });
      setNotice("Extracted text saved.");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not save extracted text.");
    } finally {
      setIsSavingExtraction(false);
    }
  }

  function renderExtractionDetails() {
    if (!selectedItem) return null;

    return (
      <div className="document-details">
        <div className="extraction-panel">
          <div className="extraction-panel-head">
            <div>
              <strong>{selectedItem.title}</strong>
              <span>{isLoadingExtraction ? "Loading extracted text..." : selectedItem.detail}</span>
            </div>
            <span className={`document-status ${extractionStatusClass(selectedItem.status)}`}>{extractionStatusLabel(selectedItem.status)}</span>
          </div>
          <textarea
            className="extraction-textarea"
            value={extractedText}
            onChange={(event) => setExtractedText(event.target.value)}
            placeholder="Extracted text will appear here."
            disabled={isLoadingExtraction || selectedItem.status !== "completed"}
          />
          <div className="extraction-actions">
            <span>{extractedText.length.toLocaleString()} character{extractedText.length === 1 ? "" : "s"}</span>
            <button className="btn btn-primary btn-sm" type="button" onClick={saveExtraction} disabled={isLoadingExtraction || isSavingExtraction || !selectedExtraction}>
              {isSavingExtraction ? "Saving..." : "Save extracted text"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageIntro title="Knowledge Base" body="Upload documents or scrape a single web page into company knowledge." />
      {notice ? <div className="form-alert success mb-4">{notice}</div> : null}
      {uploadError ? <div className="form-alert error mb-4">{uploadError}</div> : null}
      <div className="knowledge-base-layout">
        <Card title="Knowledge sources">
          <form className="crawler-panel" onSubmit={startWebsiteDiscovery}>
            <div className="crawler-head">
              <div>
                <h4>Discover website pages</h4>
                <p>Find sitemap URLs first, then follow same-site links up to depth 5. You approve URLs before scraping starts.</p>
              </div>
              <button className="btn btn-primary" type="submit" disabled={isDiscovering || !crawlUrl.trim()}>
                {isDiscovering ? "Starting..." : "Find pages"}
              </button>
            </div>
            <div className="field">
              <label htmlFor="website-crawl-url">Website URL</label>
              <input
                id="website-crawl-url"
                className="form-control"
                type="url"
                value={crawlUrl}
                onChange={(event) => setCrawlUrl(event.target.value)}
                placeholder="https://nirban.org"
                disabled={isDiscovering}
              />
            </div>
            <div className="crawler-category-grid">
              {crawlCategories.map((category) => (
                <label className={`crawler-category ${selectedCrawlCategories.has(category.id) ? "selected" : ""}`} key={category.id}>
                  <input
                    type="checkbox"
                    checked={selectedCrawlCategories.has(category.id)}
                    onChange={() => toggleCrawlCategory(category.id)}
                  />
                  <span><strong>{category.label}</strong><small>{category.description}</small></span>
                </label>
              ))}
            </div>
            <label className="field">
              <span>Additional prompt</span>
              <textarea
                className="form-control"
                value={crawlPrompt}
                onChange={(event) => setCrawlPrompt(event.target.value)}
                placeholder="Add all pages related to company policy and static company data needed for support."
                disabled={isDiscovering}
              />
            </label>
          </form>

          {activeCrawl ? (
            <div className="crawl-review-panel">
              <div className="crawl-review-head">
                <div>
                  <strong>{activeCrawl.normalized_root_url}</strong>
                  <span>{activeCrawl.status === "completed" ? `${activeCrawl.total_matched} matched from ${activeCrawl.total_discovered} discovered URLs` : activeCrawl.status === "failed" ? activeCrawl.error_message : "Discovering pages..."}</span>
                </div>
                <span className={`document-status ${crawlStatusClass(activeCrawl.status)}`}>{crawlStatusLabel(activeCrawl.status)}</span>
              </div>
              {activeCrawl.status === "completed" ? (
                <>
                  <div className="crawl-actions">
                    <label className="field web-wait-field">
                      <span>Scrape wait</span>
                      <input className="form-control" type="number" min="0" max="10" value={webWaitSeconds} onChange={(event) => setWebWaitSeconds(Number(event.target.value))} />
                    </label>
                    <label className="field manual-url-field">
                      <span>Add URL manually</span>
                      <div className="manual-url-row">
                        <input className="form-control" type="url" value={manualCrawlUrl} onChange={(event) => setManualCrawlUrl(event.target.value)} placeholder="https://example.com/page" />
                        <button className="btn btn-secondary btn-sm" type="button" onClick={addManualCrawlUrl}>Add</button>
                      </div>
                    </label>
                    <button className="btn btn-primary" type="button" onClick={queueSelectedCrawlPages} disabled={isQueueingCrawl || (selectedCandidateIds.size + manualCrawlUrls.length) === 0}>
                      {isQueueingCrawl ? "Queueing..." : `Queue ${selectedCandidateIds.size + manualCrawlUrls.length} page${selectedCandidateIds.size + manualCrawlUrls.length === 1 ? "" : "s"}`}
                    </button>
                  </div>
                  {manualCrawlUrls.length > 0 ? (
                    <div className="manual-url-list">
                      {manualCrawlUrls.map((url) => (
                        <button type="button" key={url} onClick={() => setManualCrawlUrls((existing) => existing.filter((item) => item !== url))}>{url} x</button>
                      ))}
                    </div>
                  ) : null}
                  <div className="recrawl-row">
                    <label><input type="checkbox" checked={recrawlEnabled} onChange={(event) => setRecrawlEnabled(event.target.checked)} /> Re-crawl this website automatically</label>
                    <input className="form-control" type="number" min="1" max="90" value={recrawlIntervalDays} onChange={(event) => setRecrawlIntervalDays(Number(event.target.value))} disabled={!recrawlEnabled} />
                    <button className="btn btn-secondary btn-sm" type="button" onClick={saveRecrawlSchedule}>Save schedule</button>
                  </div>
                  <div className="crawl-candidate-list">
                    {activeCrawl.candidates.length === 0 ? <div className="document-empty">No matching URLs found. Try another category or prompt.</div> : null}
                    {activeCrawl.candidates.map((candidate) => (
                      <label className={`crawl-candidate ${selectedCandidateIds.has(candidate.id) ? "selected" : ""}`} key={candidate.id}>
                        <input
                          type="checkbox"
                          checked={selectedCandidateIds.has(candidate.id)}
                          onChange={() => toggleCandidate(candidate.id)}
                          disabled={candidate.status === "queued"}
                        />
                        <span>
                          <strong>{candidate.title || candidate.url}</strong>
                          <small>{candidate.url}</small>
                          <em>{candidate.match_reason || "Matched selected criteria"} · depth {candidate.depth} · {candidate.discovery_source}</em>
                        </span>
                      </label>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          <form className="web-scrape-form" onSubmit={handleWebScrapeSubmit}>
            <div className="field">
              <label htmlFor="web-scrape-url">Quick single page URL</label>
              <input
                id="web-scrape-url"
                className="form-control"
                type="url"
                value={webUrl}
                onChange={(event) => setWebUrl(event.target.value)}
                placeholder="https://example.com/help/article"
                disabled={isScraping}
              />
            </div>
            <button className="btn btn-secondary" type="submit" disabled={isScraping || !webUrl.trim()}>
              {isScraping ? "Queueing..." : "Scrape one page"}
            </button>
          </form>

          <label className={`dashboard-upload-zone ${isUploading ? "busy" : ""}`} htmlFor="dashboard-doc-upload">
            <input
              id="dashboard-doc-upload"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.md,.txt,.csv"
              onChange={handleDocumentUpload}
              disabled={isUploading}
            />
            <span className="upload-icon">UP</span>
            <span>
              <strong>{isUploading ? "Uploading documents..." : "Upload PDF or document files"}</strong>
              <small>Files are stored under this workspace in backend storage.</small>
            </span>
          </label>

          <div className="knowledge-section-title">Uploaded documents</div>
          <div className="document-list">
            {isLoadingDocs ? <div className="document-empty">Loading documents...</div> : null}
            {!isLoadingDocs && documents.length === 0 ? <div className="document-empty">No documents uploaded yet.</div> : null}
            {documents.map((document) => {
              const isExpanded = selectedItem?.kind === "document" && selectedItem.id === document.id;

              return (
                <div className={`document-item ${isExpanded ? "expanded" : ""}`} key={document.id}>
                  <div className="document-row">
                    <div className="document-icon">{documentIcon(document.original_filename)}</div>
                    <div className="document-info">
                      <strong>{document.original_filename}</strong>
                      <span>{formatBytes(document.size_bytes)} uploaded {formatDate(document.created_at)}</span>
                      <span className="document-extraction-detail">{extractionDetail(document)}</span>
                    </div>
                    <span className={`document-status ${extractionStatusClass(document.extraction_status)}`}>{extractionStatusLabel(document.extraction_status)}</span>
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => isExpanded ? closeExtraction() : openExtraction(document)} disabled={document.extraction_status !== "completed"}>
                      {isExpanded ? "Hide text" : "View text"}
                    </button>
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => removeDocument(document.id)}>Remove</button>
                  </div>
                  {isExpanded ? renderExtractionDetails() : null}
                </div>
              );
            })}
          </div>

          <div className="knowledge-section-title">Scraped pages</div>
          <div className="document-list">
            {isLoadingWebPages ? <div className="document-empty">Loading scraped pages...</div> : null}
            {!isLoadingWebPages && webPages.length === 0 ? <div className="document-empty">No web pages scraped yet.</div> : null}
            {webPages.map((page) => {
              const isExpanded = selectedItem?.kind === "web_page" && selectedItem.id === page.id;

              return (
                <div className={`document-item ${isExpanded ? "expanded" : ""}`} key={page.id}>
                  <div className="document-row">
                    <div className="document-icon">WEB</div>
                    <div className="document-info">
                      <strong>{page.source_title || page.source_url}</strong>
                      <span>{page.source_url}</span>
                      <span className="document-extraction-detail">{webPageDetail(page)}</span>
                    </div>
                    <span className={`document-status ${extractionStatusClass(page.status)}`}>{extractionStatusLabel(page.status)}</span>
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => isExpanded ? closeExtraction() : openWebExtraction(page)} disabled={page.status !== "completed"}>
                      {isExpanded ? "Hide text" : "View text"}
                    </button>
                    <button className="btn btn-secondary btn-sm" type="button" onClick={() => removeWebPage(page.id)}>Remove</button>
                  </div>
                  {isExpanded ? renderExtractionDetails() : null}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
