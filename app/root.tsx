import "~/tailwind.css";

import {
  json,
  type HeadersFunction,
  type LinksFunction,
  type LoaderFunction,
  type AppLoadContext,
} from "@remix-run/cloudflare";
import { cssBundleHref } from "@remix-run/css-bundle";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Card } from "./components/card";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export const headers: HeadersFunction = () => ({
  "WWW-Authenticate": "Basic",
});

const isAuthorized = (context: AppLoadContext, request: Request) => {
  const header = request.headers.get("Authorization");

  if (!header) return false;

  const base64 = header.replace("Basic ", "");
  const [username, password] = atob(base64).toString().split(":");

  return username === context.env.USERNAME && password === context.env.PASSWORD;
};

export const loader: LoaderFunction = async ({ context, request }) => {
  if (!isAuthorized(context, request)) {
    return json(false, { status: 401 });
  }

  return json(true);
};

export default function App() {
  const authorized = useLoaderData();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-100">
        {authorized ? (
          <div>
            <div className="container mx-auto my-8">
              <Card>
                <Outlet />
              </Card>
            </div>
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </div>
        ) : null}
      </body>
    </html>
  );
}
