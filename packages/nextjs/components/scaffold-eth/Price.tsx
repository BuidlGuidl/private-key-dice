"use client";

import { useState } from "react";
import { useGlobalState } from "~~/services/store/store";

type TPriceProps = {
  value: number;
};

export const Price: React.FC<TPriceProps> = ({ value }: TPriceProps) => {
  const [dollarMode, setDollarMode] = useState(true);
  const nativePrice = useGlobalState(state => state.nativeCurrency.price);

  const isValueNaN = isNaN(value);
  let displayBalance = isValueNaN ? NaN : "Ξ " + value.toFixed(4);

  if (!isValueNaN && dollarMode && nativePrice > 0) {
    displayBalance = "$" + (value * nativePrice).toFixed(2);
  }

  return (
    <span
      style={{
        cursor: "pointer",
      }}
      onClick={() => {
        if (nativePrice > 0) {
          setDollarMode(!dollarMode);
        }
      }}
    >
      {displayBalance}
    </span>
  );
};
