$(document).ready(function () {
  function formatINR(amount) {
    return Number(amount).toLocaleString("en-IN");
  }

  $("#back_btn").on("click", function () {
    history.back();
  });

  var selected_verient = localStorage.getItem("selected_verient");
  itemData = JSON.parse(selected_verient);

  $("#item_image").prop("src", itemData.img1);
  var detail =
    (itemData.color || "") +
    (itemData.size ? " (" + itemData.size + ")" : "") +
    (itemData.storage ? " (" + itemData.storage + ")" : "");

  $("#product-title").html(itemData.name);
  $("#product-detail").html(detail);

  $(".selling_price, .payable").html(
    "&#8377;" + formatINR(itemData.selling_price)
  );
  $(".mrp").html("&#8377;" + formatINR(itemData.mrp));

  var disc_amt = itemData.mrp - itemData.selling_price;
  $(".discount-amt").html("-&#8377;" + formatINR(disc_amt));

  let disc = (100 - (itemData.selling_price * 100) / itemData.mrp).toFixed(0);
  disc = disc == 100 ? 99 : disc;
  $(".discount").html(disc + "%");

  var add = localStorage.getItem("address");
  var address = JSON.parse(add);
  if (address) {
    $(".customer-name").html(address.name);
    $(".customer-address").html(
      address.flat +
        ", " +
        address.area +
        ", " +
        address.city +
        ", " +
        address.state +
        " " +
        address.pin
    );
    $(".customer-contact").html(address.number);
  }
});

function btnContinue() {
  window.location.href = './payment.html';
}
