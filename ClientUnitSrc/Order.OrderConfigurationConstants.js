define("OrderConfigurationConstants", [], function() {
	var order = {
		OrderStatus: {
			InPlanned: "1f3ad326-effd-4ac3-a3e2-957e7def3684",
			InProgress: "29fa66e3-ef69-4feb-a5af-ec1de125a614",
			Running: "c8742634-ea8b-46d9-ba71-1989b951772d",
			Postprocessing: "5ab26d74-2fd1-4674-bae0-7622aa8383995",
			Closed: "40de86ee-274d-4098-9b92-9ebdcf83d4fc",
			Canceled: "8ab0f830-908b-40d7-80a3-7f49ef70ce70"
		},
		PaymentStatus: {
			InPlanned: "bfe38d3d-bd57-48d7-a2d7-82435cd274ca",
			WaitingPayment: "448d1338-d3a5-4fd4-9a6e-769403f89896",
			Paid: "4721338e-a5f1-4529-96be-d3f311518812",
			PartiallyPaid: "a2f17c7b-956b-47c8-9ea5-b545b74a26f6",
			Canceled: "309e5219-114d-4a6e-b5b0-fe33caeca4dd"
		},
		DeliveryStatus: {
			InPlanned: "867ca155-bfa5-4aaa-9172-7813dd4e85f5",
			WaitingDelivery: "66464653-540e-46f3-b444-db2330706b02",
			PartiallyDelivery: "20f1fcf7-34d8-4c00-b4ae-6d9184c7945f",
			Delivery: "0dd2c99b-9a1a-4419-886e-842a20d35929",
			Canceled: "31b73f97-8e8d-4505-a24f-0b8fc21d0755"
		},
		DeliveryType: {
			Courier: "50df77d0-7b1f-4dbc-a02d-7b6ebb95dfd0",
			Pickup: "ab31305f-7c6d-4158-bd0a-760ac7897755"
		},
		PaymentType: {
			Clearing: "c2d88243-685d-4e8b-a533-73f4cb8e869b",
			Cash: "0026bde9-932b-4baa-ba30-ffa521a255ab"
		}
	};
	var supplyPaymentElement = {
		Type: {
			Payment: "d868f4b7-4946-4bb1-94bb-6fb93a513ce4"
		}
	};
	return {
		Order: order,
		SupplyPaymentElement: supplyPaymentElement
	};
});