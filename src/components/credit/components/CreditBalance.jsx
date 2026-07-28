import React from "react";
import { Card } from "antd";
import { useRouter } from "next/router";
import { ArrowUpRight } from "lucide-react";
import { useCreditBalance } from "@/hooks/useCreditBalance";

const CreditBalance = ({ user, layout = "compact" }) => {
  const router = useRouter();
  const userIdentity = user?.user?.role;
  const { data: creditData } = useCreditBalance({ poll: false, enabled: Boolean(user?.user?._id) });
  const credits = creditData?.data || [];
  const imageCredit = credits.find((w) => w.creditType === 0);
  const contentCredit = credits.find((w) => w.creditType === 1);
  const isMasterHq = userIdentity === "masterHQ";
  const isOutlet = userIdentity === "outlet";

  const formatMasterAmount = (credit) => {
    if (!credit || credit.availableAmount == null) return null;
    const remaining = credit.availableAmount;
    return `${remaining} Credits`;
  };

  const formatOutletAmount = (credit) => {
    if (!credit) return null;
    const used = credit.actualUsed ?? 0;
    if (credit.limit == null) {
      // Shared-pool outlet: used out of the available (unreserved) HQ pool.
      return credit.availableAmount == null ? null : `${used} / ${credit.availableAmount} Credits`;
    }
    return `${used} / ${credit.limit} Used`;
  };

  const visualAmount = isMasterHq
    ? formatMasterAmount(imageCredit)
    : isOutlet
      ? formatOutletAmount(imageCredit)
      : null;

  const contentAmount = isMasterHq
    ? formatMasterAmount(contentCredit)
    : isOutlet
      ? formatOutletAmount(contentCredit)
      : null;

  const handleClick = () => {
    router.push("/credit/credit");
  };

  if (layout === "full") {
    return (
      <Card
        className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg cursor-pointer"
        onClick={handleClick}
        bodyStyle={{ padding: 16 }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center justify-between gap-6">
            <div className="flex flex-col">
              <p className="text-base font-bold text-white">Visual</p>
              {visualAmount ? (
                <p className="text-sm font-normal text-gray-200">{visualAmount}</p>
              ) : null}
            </div>
            <div className="flex flex-col">
              <p className="text-base font-bold text-white">Content</p>
              {contentAmount ? (
                <p className="text-sm font-normal text-gray-200">{contentAmount}</p>
              ) : null}
            </div>
          </div>
          <p className="text-xs text-black-500 hover:underline">
            <ArrowUpRight size={16} color="white" />
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg cursor-pointer"
      onClick={handleClick}
      bodyStyle={{ padding: 16 }}
    >
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <div>
            <p className="text-base font-bold flex flex-row items-center text-white">Visual</p>
            {visualAmount ? (
              <p className="text-sm font-normal text-gray-200">{visualAmount}</p>
            ) : null}
          </div>
          <div className="mt-2">
            <p className="text-base font-bold flex flex-row items-center text-white">Content</p>
            {contentAmount ? (
              <p className="text-sm font-normal text-gray-200">{contentAmount}</p>
            ) : null}
          </div>
        </div>
        <p className="text-xs text-black-500 hover:underline">
          <ArrowUpRight size={15} color="white" />
        </p>
      </div>
    </Card>
  );
};

export default CreditBalance;
