import React from "react";
import AdvocateCard from "../AdvocateCard";

const AdvocateResults = ({ advocates, filters, onViewAdvocate }) => {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {advocates.map((advocate) => {
        const displayAdvocate = {
          ...advocate,
          practiceAreas: filters.practiceArea
            ? [filters.practiceArea]
            : advocate.practiceAreas,
        };

        return (
          <AdvocateCard
            key={advocate.id}
            advocate={displayAdvocate}
            onViewAdvocate={onViewAdvocate}
          />
        );
      })}
    </div>
  );
};

export default AdvocateResults;
