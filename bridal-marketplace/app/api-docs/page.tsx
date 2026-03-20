"use client";

import dynamic from "next/dynamic";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI
        url="/api/openapi"
        persistAuthorization
        tryItOutEnabled
        requestInterceptor={(req) => {
          req.credentials = "include";
          return req;
        }}
      />
    </div>
  );
}
