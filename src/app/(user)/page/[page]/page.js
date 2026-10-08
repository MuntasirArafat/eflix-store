import pages from "../../../data/pages";
import { notFound } from "next/navigation";

export default async function Page({ params }) {
  const { page } = await params;

  const data = pages[page];

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl  p-6">
      <h1 className="text-xl font-bold">{data.title}</h1>

      <p className="mt-2 text-muted-foreground">{data.description}</p>

    <div
    className="
    prose
    prose-neutral
    dark:prose-invert
    max-w-none

    prose-headings:font-semibold
    prose-h2:mt-10
    prose-h2:mb-4
    prose-h3:mt-8
    prose-h3:mb-3

    prose-p:leading-7
    prose-li:leading-7

     prose-a:text-primary
     prose-a:no-underline
     hover:prose-a:underline
     "
        dangerouslySetInnerHTML={{
          __html: data.html,
        }}
      />
    </div>
  );
}
