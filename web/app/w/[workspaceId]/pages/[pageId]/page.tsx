import { getPage } from "@/lib/api";
import { PageEditorLoader } from "@/components/page-editor-loader";

interface Props {
  params: Promise<{ workspaceId: string; pageId: string }>;
}

export default async function PageRoute({ params }: Props) {
  const { pageId } = await params;
  const page = await getPage(pageId);

  return <PageEditorLoader initialPage={page} />;
}
