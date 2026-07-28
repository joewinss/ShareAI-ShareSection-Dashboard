import { useRouter } from "next/router";
import MerchantDrawFlowPage from "@/components/shareContent/merchantDraw/page/MerchantDrawFlowPage";

export default function LuckyDrawIndex() {
    const router = useRouter();
    const userId = router.isReady ? router.query?.userId : undefined;
    const phone = router.isReady ? router.query?.phone : undefined;
    const token = router.isReady ? router.query?.token : undefined;
    const platform = router.isReady ? router.query?.platform : undefined;

    return <MerchantDrawFlowPage token={token} userId={userId} phone={phone} platform={platform} />;
}

export async function getStaticProps() {
    return { props: {} };
}
