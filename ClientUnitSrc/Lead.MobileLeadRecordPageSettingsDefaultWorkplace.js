[
	{
		"operation": "insert",
		"name": "settings",
		"values": {
			"entitySchemaName": "Lead",
			"settingsType": "RecordPage",
			"localizableStrings": {
				"primaryColumnSetLead_caption": "Основная информация",
				"communicationColumnSetLead_caption": "Средства связи",
				"addressColumnSetLead_caption": "Адрес",
				"secondaryColumnSetLead_caption": "Дополнительно",
				"ActivityDetailV2StandartDetailLead_caption": "Активности"
			},
			"columnSets": [],
			"operation": "insert",
			"details": []
		}
	},
	{
		"operation": "insert",
		"name": "primaryColumnSet",
		"values": {
			"items": [],
			"rows": 1,
			"entitySchemaName": "Lead",
			"caption": "primaryColumnSetLead_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "761a23e9-a2ac-43bf-8342-fb8263e02481",
		"values": {
			"row": 2,
			"content": "Полное название должности",
			"columnName": "FullJobTitle",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "primaryColumnSet",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "00523cc5-3ed8-4138-8787-c340f7bbd862",
		"values": {
			"row": 3,
			"content": "Отрасль",
			"columnName": "Industry",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "primaryColumnSet",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "6264ce02-9ee1-413c-8475-3902d24a167e",
		"values": {
			"row": 0,
			"content": "Название контрагента",
			"columnName": "Account",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "primaryColumnSet",
		"propertyName": "items",
		"index": 2
	},
	{
		"operation": "insert",
		"name": "2df7b7a9-f8f2-4141-8ecd-915e1a5c7794",
		"values": {
			"row": 1,
			"content": "ФИО",
			"columnName": "Contact",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "primaryColumnSet",
		"propertyName": "items",
		"index": 3
	},
	{
		"operation": "insert",
		"name": "communicationColumnSet",
		"values": {
			"items": [],
			"rows": 1,
			"entitySchemaName": "Lead",
			"caption": "communicationColumnSetLead_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "ddceaf42-523e-4404-90e7-44ed11f39680",
		"values": {
			"row": 0,
			"content": "Рабочий телефон",
			"columnName": "BusinesPhone",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "communicationColumnSet",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "0e056565-8dfd-4f8c-9096-faa627e631e5",
		"values": {
			"row": 1,
			"content": "Мобильный телефон",
			"columnName": "MobilePhone",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "communicationColumnSet",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "eb894ec2-7b2f-4832-93ef-f8597cde6e4c",
		"values": {
			"row": 2,
			"content": "E-mail",
			"columnName": "Email",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "communicationColumnSet",
		"propertyName": "items",
		"index": 2
	},
	{
		"operation": "insert",
		"name": "514eaa97-a2d2-4a8e-bfb2-ca231218b3fd",
		"values": {
			"row": 3,
			"content": "Факс",
			"columnName": "Fax",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "communicationColumnSet",
		"propertyName": "items",
		"index": 3
	},
	{
		"operation": "insert",
		"name": "d86bf5a0-e08f-4d7b-889f-975bec7eb96b",
		"values": {
			"row": 4,
			"content": "Web",
			"columnName": "Website",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "communicationColumnSet",
		"propertyName": "items",
		"index": 4
	},
	{
		"operation": "insert",
		"name": "addressColumnSet",
		"values": {
			"items": [],
			"rows": 1,
			"entitySchemaName": "Lead",
			"caption": "addressColumnSetLead_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 2
	},
	{
		"operation": "insert",
		"name": "bc9a884b-96e9-46ca-b0f1-e6a716b1be82",
		"values": {
			"row": 0,
			"content": "Адрес",
			"columnName": "Address",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "addressColumnSet",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "655ed28c-52a1-499b-9095-6f8252e3f66c",
		"values": {
			"row": 1,
			"content": "Город",
			"columnName": "City",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "addressColumnSet",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "59943a3f-4bd1-413e-8a7e-51d260de4131",
		"values": {
			"row": 2,
			"content": "Область/штат",
			"columnName": "Region",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "addressColumnSet",
		"propertyName": "items",
		"index": 2
	},
	{
		"operation": "insert",
		"name": "ff700554-5fc9-4fb9-9a98-7a791ed0435e",
		"values": {
			"row": 3,
			"content": "Страна",
			"columnName": "Country",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "addressColumnSet",
		"propertyName": "items",
		"index": 3
	},
	{
		"operation": "insert",
		"name": "f4d2f981-93ff-427e-9b8c-8984ddab8761",
		"values": {
			"row": 4,
			"content": "Индекс",
			"columnName": "Zip",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "addressColumnSet",
		"propertyName": "items",
		"index": 4
	},
	{
		"operation": "insert",
		"name": "b5174eda-b28f-4215-91ee-7c3f90400fc6",
		"values": {
			"row": 5,
			"content": "Тип адреса",
			"columnName": "AddressType",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "addressColumnSet",
		"propertyName": "items",
		"index": 5
	},
	{
		"operation": "insert",
		"name": "secondaryColumnSet",
		"values": {
			"items": [],
			"rows": 1,
			"entitySchemaName": "Lead",
			"caption": "secondaryColumnSetLead_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 3
	},
	{
		"operation": "insert",
		"name": "f8131da8-5f48-47f7-acdf-d48a95df8068",
		"values": {
			"row": 0,
			"content": "Источник",
			"columnName": "InformationSource",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "secondaryColumnSet",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "28aacb4c-9a83-4c78-a389-ccddde1b7332",
		"values": {
			"row": 1,
			"content": "Комментарий",
			"columnName": "Commentary",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "secondaryColumnSet",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "ActivityDetailV2StandartDetail",
		"values": {
			"caption": "ActivityDetailV2StandartDetailLead_caption",
			"entitySchemaName": "Activity",
			"filter": {
				"detailColumn": "Lead",
				"masterColumn": "Id"
			},
			"detailSchemaName": "ActivityDetailV2",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "details",
		"index": 0
	}
]