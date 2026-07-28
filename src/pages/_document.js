import Document, { Html, Head, Main, NextScript } from 'next/document';
import client, { ENV_VAL } from '../../env';
import Script from 'next/script';

const { env, googleTag } = client.uri;
const renderGA = env === ENV_VAL.LIVE;
class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* <!-- Google tag (gtag.js) -->
          {renderGA ? (
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleTag}`}
              strategy="beforeInteractive"
            />
          ) : null}
          {renderGA ? (
            <Script id="gtag-init" strategy="beforeInteractive">
              {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleTag}');
            `}
            </Script>
          ) : null} */}
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
            crossOrigin="anonymous"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
