interface Props {
  message?: string;
}

export default function DemoNoticeBanner({
  message = "وضع العرض التجريبي: لا توجد نتائج حقيقية من موديل التحليل. القيم غير المتاحة معروضة كشرطة بدل اختراع إحصائيات.",
}: Props) {
  return (
    <div className="demo-notice-banner" role="status">
      <p>{message}</p>
    </div>
  );
}
