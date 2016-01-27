define("SpecificationConstants", [], function() {
	var specificationTypes = {
		StringType : "7aad419a-9e7a-4785-8d13-c7ff1402e13d",
		IntType : "2212241a-71eb-468b-a3d5-c0f39dfe51c9",
		FloatType : "beb46531-4f29-452c-be18-1ed5f1aa8b80",
		BooleanType : "359e0e35-bb39-4f07-9b9f-aec6ad076828",
		ListType : "ecf578a0-4b4d-40e6-909c-39af2a798d32"
	};
	var productFilterType = {
		Field: "1ea89785-cac0-4ecf-bc4c-64886d8c5577",
		Specification: "dafb427d-f1c2-4f6a-adc9-9d16f7eb0406",
		Price: "e9a1903a-9220-4793-bfe2-85d5b5648b2f"
	};
	return {
		SpecificationTypes: specificationTypes,
		ProductFilterType: productFilterType
	};
});