import { FeedbackDetail } from "@/components/FeedbackDetail";

type FeedbackDetailPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function FeedbackDetailPage({ params }: FeedbackDetailPageProps) {
  const { id } = await params;
  return <FeedbackDetail id={id} />;
}
