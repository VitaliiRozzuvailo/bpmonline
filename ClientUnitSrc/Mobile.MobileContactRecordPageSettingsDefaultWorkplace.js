[
	{
		"operation": "insert",
		"name": "settings",
		"values": {
			"entitySchemaName": "Contact",
			"settingsType": "RecordPage",
			"localizableStrings": {
				"primaryColumnSetContact_caption": "Основная информация",
				"ContactCommunicationDetailEmbeddedDetailContact_caption": "Средства связи Контакта ",
				"ContactAddressDetailV2EmbeddedDetailContact_caption": "Адреса Контакта",
				"jobColumnSetContact_caption": "Место работы",
				"ContactAnniversaryDetailV2EmbeddedDetailContact_caption": "Знаменательные события Контакта",
				"ActivityDetailV2StandartDetailContact_caption": "Активности"
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
			"entitySchemaName": "Contact",
			"caption": "primaryColumnSetContact_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "eb04facc-0b61-43a4-983a-8c114eec6d1b",
		"values": {
			"row": 0,
			"content": "ФИО",
			"columnName": "Name",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "primaryColumnSet",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "9a4cff61-0594-439e-8b94-874adbea8b61",
		"values": {
			"row": 1,
			"content": "Контрагент",
			"columnName": "Account",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "primaryColumnSet",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "ContactCommunicationDetailEmbeddedDetail",
		"values": {
			"items": [],
			"rows": 1,
			"isDetail": true,
			"filter": {
				"detailColumn": "Contact",
				"masterColumn": "Id"
			},
			"detailSchemaName": "ContactCommunicationDetail",
			"entitySchemaName": "ContactCommunication",
			"caption": "ContactCommunicationDetailEmbeddedDetailContact_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "4e5359c4-9805-4850-b6b5-9da6a38f10ce",
		"values": {
			"row": 1,
			"content": "Номер",
			"columnName": "Number",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "ContactCommunicationDetailEmbeddedDetail",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "1a7c0d7f-50f4-48d7-ad5a-f7cf14258271",
		"values": {
			"row": 0,
			"content": "Тип",
			"columnName": "CommunicationType",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "ContactCommunicationDetailEmbeddedDetail",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "ContactAddressDetailV2EmbeddedDetail",
		"values": {
			"items": [],
			"rows": 1,
			"isDetail": true,
			"filter": {
				"detailColumn": "Contact",
				"masterColumn": "Id"
			},
			"detailSchemaName": "ContactAddressDetailV2",
			"entitySchemaName": "ContactAddress",
			"caption": "ContactAddressDetailV2EmbeddedDetailContact_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 2
	},
	{
		"operation": "insert",
		"name": "43f1ac43-ddd2-4389-8ccf-782a89bf47c9",
		"values": {
			"row": 0,
			"content": "Тип адреса",
			"columnName": "AddressType",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "ContactAddressDetailV2EmbeddedDetail",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "df7d53ec-885a-43b7-99ec-14f0e9f36d78",
		"values": {
			"row": 1,
			"content": "Адрес",
			"columnName": "Address",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "ContactAddressDetailV2EmbeddedDetail",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "7af60027-7759-456d-848f-de3a7bbd727a",
		"values": {
			"row": 2,
			"content": "Город",
			"columnName": "City",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "ContactAddressDetailV2EmbeddedDetail",
		"propertyName": "items",
		"index": 2
	},
	{
		"operation": "insert",
		"name": "0bc9e17d-d39b-4082-886c-0693181175a4",
		"values": {
			"row": 3,
			"content": "Область/штат",
			"columnName": "Region",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "ContactAddressDetailV2EmbeddedDetail",
		"propertyName": "items",
		"index": 3
	},
	{
		"operation": "insert",
		"name": "7fd1d967-c76d-4523-87b8-ea32b6f6da3c",
		"values": {
			"row": 4,
			"content": "Страна",
			"columnName": "Country",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "ContactAddressDetailV2EmbeddedDetail",
		"propertyName": "items",
		"index": 4
	},
	{
		"operation": "insert",
		"name": "322bdac5-8965-4571-8ef1-180e1da25634",
		"values": {
			"row": 5,
			"content": "Индекс",
			"columnName": "Zip",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "ContactAddressDetailV2EmbeddedDetail",
		"propertyName": "items",
		"index": 5
	},
	{
		"operation": "insert",
		"name": "jobColumnSet",
		"values": {
			"items": [],
			"rows": 1,
			"entitySchemaName": "Contact",
			"caption": "jobColumnSetContact_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 3
	},
	{
		"operation": "insert",
		"name": "2883d472-fa1c-469a-b83f-ac45fa50c616",
		"values": {
			"row": 0,
			"content": "Департамент",
			"columnName": "Department",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "jobColumnSet",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "6b01ece7-8756-470c-85da-afc17498fcba",
		"values": {
			"row": 1,
			"content": "Полное название должности",
			"columnName": "JobTitle",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "jobColumnSet",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "ContactAnniversaryDetailV2EmbeddedDetail",
		"values": {
			"items": [],
			"rows": 1,
			"isDetail": true,
			"filter": {
				"detailColumn": "Contact",
				"masterColumn": "Id"
			},
			"detailSchemaName": "ContactAnniversaryDetailV2",
			"entitySchemaName": "ContactAnniversary",
			"caption": "ContactAnniversaryDetailV2EmbeddedDetailContact_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 4
	},
	{
		"operation": "insert",
		"name": "42bf4ab2-5129-4254-a6a9-de73d7aca21a",
		"values": {
			"row": 1,
			"content": "Дата",
			"columnName": "Date",
			"dataValueType": 8,
			"operation": "insert"
		},
		"parentName": "ContactAnniversaryDetailV2EmbeddedDetail",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "2ec8b723-edba-4ca0-bd00-006db58a5d13",
		"values": {
			"row": 0,
			"content": "Тип",
			"columnName": "AnniversaryType",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "ContactAnniversaryDetailV2EmbeddedDetail",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "ActivityDetailV2StandartDetail",
		"values": {
			"caption": "ActivityDetailV2StandartDetailContact_caption",
			"entitySchemaName": "Activity",
			"filter": {
				"detailColumn": "Contact",
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