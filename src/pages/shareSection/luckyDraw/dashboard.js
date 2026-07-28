import MerchantDrawDashboard from "@/components/shareContent/merchantDraw/dashboard/MerchantDrawDashboard";

export default function LuckyDrawDashboardPage() {
    return <MerchantDrawDashboard />;
}

export async function getStaticProps() {
    return { props: {} };
}
