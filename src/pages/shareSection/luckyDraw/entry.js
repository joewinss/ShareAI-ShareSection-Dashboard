import { useRouter } from "next/router";
import MerchantDrawEntryPage from "@/components/shareContent/merchantDraw/page/MerchantDrawEntryPage";

export default function LuckyDrawEntry() {
    const router = useRouter();
    const userId = router.isReady ? router.query?.userId : undefined;
    const phone = router.isReady ? router.query?.phone : undefined;
    const token = router.isReady ? router.query?.token : undefined;
    const platform = router.isReady ? router.query?.platform : undefined;

    return <MerchantDrawEntryPage token={token} userId={userId} phone={phone} platform={platform} />;
}

export async function getStaticProps() {
    return { props: {} };
}
