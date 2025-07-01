const calculateTotalWithoutTax = (orderItems) => {
  let total = 0;
  orderItems?.map((item, index) => {
    total +=
      (item && item.total ? item.total : item.basePrice) * (item.quantity ?? 1);
  });
  return total;
};

const calculateTaxes = (total, taxes) => {
  const cgst = taxes?.cgst ?? 0;
  const sgst = taxes?.sgst ?? 0;
  const taxesResult = ((cgst + sgst) / 100) * total;
  return parseFloat(taxesResult).toFixed(2);
};

const calculateTotalwithTax = (orderItems, taxes) => {
  const total = calculateTotalWithoutTax(orderItems);
  return total + parseFloat(calculateTaxes(total, taxes));
};

const getItemCost = (item) => {
  let cost = item.basePrice * (item?.quantity ?? 1);
  if (item?.addOns) {
    item?.addOns?.map((addon) => {
      cost += +addon?.price;
    });
  }
  return cost;
};
const calculateAllOrdersDiscountableAmount = (orders) => {
  return orders?.reduce((discountableAmount, order) => {
    if (!order?.payment?.due) {
      const orderDiscountableAmount = order?.items?.reduce((itemSum, item) => {
        if (item?.isDiscountEligible) {
          const itemAddOnCost =
            item.addOns?.reduce((sum, addon) => sum + addon.price, 0) || 0;
          console.log(itemAddOnCost);
          const itemCost =
            (item.basePrice + itemAddOnCost) * (item.quantity || 1);
          console.log(itemCost);
          return itemSum + itemCost;
        }
        return itemSum;
      }, 0);
      return discountableAmount + orderDiscountableAmount;
    }
    return discountableAmount;
  }, 0);
};

function calculateSettlement(orders, payment, user_id = null) {
  const {
    waivedOff: globalWaivedOff,
    discountApplied,
    tip,
    due: globalDue,
  } = payment ?? { waivedOff: 0, discount: 0, tip: 0, paid: 0 };
  let customerPayment = payment?.paid ?? 0;
  let customerDue = payment?.due ?? 0;
  let allOrdersDiscountableAmount =
    calculateAllOrdersDiscountableAmount(orders);

  let totalUnpaidAmount = orders.reduce((sum, order) => {
    let total = 0;
    if (order?.payment?.due > 0) {
      total = order?.payment?.due;
    } else {
      for (let i = 0; i < order?.items?.length; i++) {
        let item = order?.items[i];
        let itemAddOnCost =
          item?.addOns?.reduce((sum, addon) => sum + addon?.price, 0) ?? 0;
        let itemCost = (item.basePrice + itemAddOnCost) * (item?.quantity ?? 1);
        const taxAmount =
          item?.taxable && item?.tax
            ? ((+item?.tax?.cgst + +item?.tax?.sgst) / 100) * itemCost
            : 0;
        total += itemCost + taxAmount;
        // total += itemCost;
      }
    }
    return Math.round(sum + total);
  }, 0);

  const updatedOrders = orders.map((order) => {
    const { tip = 0, roundedOff = 0, paid: alreadyPaid, due } = order?.payment;
    // console.log("wsxda", due);
    let orderTotal = 0;
    let pendingPayment = 0;
    let orderDiscount = 0;
    let orderWaivedOff = 0;
    let orderDue = 0;
    let discountableAmount = 0;
    let orderTotalWT = 0;
    for (let i = 0; i < order?.items?.length; i++) {
      let item = order?.items[i];
      let itemAddOnCost =
        item?.addOns?.reduce((sum, addon) => sum + addon?.price, 0) ?? 0;
      let itemCost = item?.isDiscountEligible
        ? (item.basePrice + itemAddOnCost) * (item?.quantity ?? 1)
        : 0;
      discountableAmount += itemCost;
    }
    const discount =
      allOrdersDiscountableAmount && !isNaN(discountableAmount)
        ? (discountableAmount / allOrdersDiscountableAmount) * discountApplied
        : 0;
    // console.log({ discountableAmount, allOrdersDiscountableAmount });
    if (discount > Math.round(totalUnpaidAmount)) {
      throw new Error("Discount exceeds total unpaid due amount");
    }
    if (globalWaivedOff > Math.round(totalUnpaidAmount - discount)) {
      throw new Error("WaivedOff amount exceeds remaining due after discount");
    }

    totalUnpaidAmount = Math.round(totalUnpaidAmount - discount);
    for (let i = 0; i < order?.items?.length; i++) {
      let item = order?.items[i];
      let itemAddOnCost =
        item?.addOns?.reduce((sum, addon) => sum + addon?.price, 0) ?? 0;

      orderTotalWT += (item.basePrice + itemAddOnCost) * (item?.quantity ?? 1);
    }

    for (let i = 0; i < order?.items?.length; i++) {
      let item = order?.items[i];
      let itemAddOnCost =
        item?.addOns?.reduce((sum, addon) => sum + addon?.price, 0) ?? 0;
      let itemCost = (item.basePrice + itemAddOnCost) * (item?.quantity ?? 1);

      const itemDiscount =
        item?.isDiscountEligible && discountableAmount > 0
          ? (itemCost / discountableAmount) *
            (order?.payment?.discount ?? discount ?? 0)
          : 0;

      const discountedCost = Math.max(itemCost - itemDiscount, 0);

      orderDiscount += itemDiscount;
      const taxAmount =
        item?.taxable && item?.tax
          ? ((+item?.tax?.cgst + +item?.tax?.sgst) / 100) * discountedCost
          : 0;

      // console.log(
      //   "TAX AMOUNT:----------------------------------------------------------- ",
      //   {
      //     taxAmount,
      //     name: item?.name,
      //     payD: order?.payment?.discount,
      //     discount,
      //     discountedCost,
      //     itemCost,
      //     customerPayment,
      //     itemDiscount,
      //   }
      // );
      orderTotal += itemCost + taxAmount;
    }
    orderTotal = orderTotal;
    if (due) {
      pendingPayment = due;
    } else {
      pendingPayment = orderTotal;
    }
    // console.log({ pendingPayment });
    if (!due && pendingPayment > 0) {
      pendingPayment = Math.round(
        pendingPayment - (order?.payment?.discount ?? discount ?? 0)
      );
      // console.log("SDJKFLSKDFJSDFLKJ: ", {
      //   pendingPayment,
      //   totalUnpaidAmount,
      //   customerPayment,
      //   globalWaivedOff,
      //   lfkjs: Math.round(
      //     (pendingPayment / totalUnpaidAmount) * (globalWaivedOff ?? 0)
      //   ),
      // });
      orderWaivedOff = Math.round(
        (pendingPayment / totalUnpaidAmount) * (globalWaivedOff ?? 0)
      );
    } else if (due) {
      // console.log("called", due);
      orderDiscount = 0;
      orderWaivedOff = Math.round(
        (order?.payment?.waivedOff ?? 0) +
          (pendingPayment / totalUnpaidAmount) * (globalWaivedOff ?? 0)
      );
    }

    pendingPayment -= orderWaivedOff - (order?.payment?.waivedOff ?? 0);

    pendingPayment = Math.round(pendingPayment);
    let newDue = 0;

    if (customerPayment >= pendingPayment) customerPayment -= pendingPayment;
    else {
      newDue = pendingPayment - customerPayment;
      customerPayment = 0;
    }
    const orderPaidAmount =
      orderTotal -
      ((order?.payment?.discount ?? orderDiscount ?? 0) +
        orderWaivedOff +
        newDue);
    const orderPaidAmountWithDue =
      orderTotal - (order?.payment?.discount ?? orderDiscount ?? 0);
    // orderTotal
    const paymentType = newDue > 0 ? "due" : "paid";
    // console.log({
    //   newDue,
    //   orderPaidAmount,
    //   tip,
    //   orderDiscount,
    //   orderWaivedOff,
    //   customerPayment,
    //   pendingPayment,
    //   orderTotal,
    // });

    return {
      _id: order._id,
      total: orderPaidAmountWithDue,
      payment: {
        discount: parseFloat(
          orderDiscount + (order?.payment?.discount ?? 0)
        ).toFixed(2),
        waivedOff: orderWaivedOff,
        due: Math.round(newDue),
        paid: orderPaidAmount,
        settlementAmount: orderPaidAmount,
        tip: tip / orders?.length,
        type: paymentType,
        ...(orderWaivedOff > 0
          ? {
              waivedOffReason: payment?.waivedOffReason,
            }
          : {}),
        roundedOff: (
          Math.round(orderPaidAmountWithDue) - orderPaidAmountWithDue.toFixed(2)
        )?.toFixed(2),
      },
      user_id: paymentType === "due" ? user_id : order.user_id,
    };
  });

  return updatedOrders;
}
function calculatePayableAmount(orderItems) {
  let newOrder = { total: 0, taxableTotal: 0 };
  let totalTaxAmount = 0;
  // const discountableAmount = calculateDiscountableAmount(orderItems);

  for (let i = 0; i < orderItems?.length; i++) {
    let item = orderItems[i];

    newOrder.total +=
      (item && item.total ? item.total : item.basePrice) *
      (item?.quantity ?? 1);

    const itemCost =
      (item && item.total ? item.total : item.basePrice) *
      (item?.quantity ?? 1);
    // const itemDiscount = (itemCost / (discountableAmount)) * totalDiscount;

    // const discountedCost = Math.max(itemCost - itemDiscount, 0);
    const taxAmount =
      item?.taxable && item?.tax
        ? ((+item?.tax?.cgst + +item?.tax?.sgst) / 100) * itemCost
        : 0;
    newOrder.taxableTotal += taxAmount + itemCost;
    totalTaxAmount += taxAmount;
  }
  return Math.round(newOrder.taxableTotal);
}

module.exports = {
  calculateTotalWithoutTax,
  calculateTaxes,
  calculateTotalwithTax,
  calculateSettlement,
  calculatePayableAmount,
};
