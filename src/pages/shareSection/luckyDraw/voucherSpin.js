import { useRouter } from "next/router";
import VoucherSpinPage from "@/components/shareContent/merchantDraw/page/VoucherSpinPage";

export default function VoucherSpinRoute() {
    const router = useRouter();
    const userId = router.isReady ? router.query?.userId : undefined;
    const phone = router.isReady ? router.query?.phone : undefined;
    const token = router.isReady ? router.query?.token : undefined;
    const platform = router.isReady ? router.query?.platform : undefined;

    return <VoucherSpinPage token={token} userId={userId} phone={phone} platform={platform} />;
}

export async function getStaticProps() {
    return { props: {} };
}
