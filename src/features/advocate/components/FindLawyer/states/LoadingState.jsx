import React from "react";
import AdvocateCardSkeleton from "../../skeleton/AdvocateCardSkeleton";

const LoadingState = () => {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {[...Array(12)].map((_, index) => (
        <AdvocateCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default LoadingState;
