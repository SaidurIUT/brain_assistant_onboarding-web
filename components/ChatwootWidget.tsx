import Script from "next/script";

const CHATWOOT_BASE_URL = "http://localhost:3000";
const CHATWOOT_WEBSITE_TOKEN = "78fDe8kJgCyRacypBgL3fQB1";

export function ChatwootWidget() {
  return (
    <Script
      id="brain-assistant-chatwoot-widget"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.chatwootSettings = {"position":"right","type":"standard","launcherTitle":"Brain Assistant"};
          (function(d,t) {
            var BASE_URL="${CHATWOOT_BASE_URL}";
            var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
            g.src=BASE_URL+"/packs/js/sdk.js";
            g.async = true;
            s.parentNode.insertBefore(g,s);
            g.onload=function(){
              window.chatwootSDK.run({
                websiteToken: "${CHATWOOT_WEBSITE_TOKEN}",
                baseUrl: BASE_URL
              })
            }
          })(document,"script");
        `
      }}
    />
  );
}
