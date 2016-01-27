[
	{
		"operation": "insert",
		"name": "settings",
		"values": {
			"entitySchemaName": "Activity",
			"settingsType": "RecordPage",
			"localizableStrings": {
				"primaryColumnSetActivity_caption": "Основная информация",
				"ActivityParticipantDetailV2EmbeddedDetailActivity_caption": "Участники Активности",
				"statusColumnSetActivity_caption": "Состояние",
				"additionalColumnSetActivity_caption": "Дополнительно",
				"relationsColumnSetActivity_caption": "Связи"
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
			"entitySchemaName": "Activity",
			"caption": "primaryColumnSetActivity_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "73811d74-c72e-4bcb-a65a-b2d009a91f62",
		"values": {
			"row": 0,
			"content": "Заголовок",
			"columnName": "Title",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "primaryColumnSet",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "7039a1ff-14d8-48f5-821d-d299befe9c3d",
		"values": {
			"row": 1,
			"content": "Начало",
			"columnName": "StartDate",
			"dataValueType": 7,
			"operation": "insert"
		},
		"parentName": "primaryColumnSet",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "a926fb72-1769-4a32-915b-06372fbb4200",
		"values": {
			"row": 2,
			"content": "Завершение",
			"columnName": "DueDate",
			"dataValueType": 7,
			"operation": "insert"
		},
		"parentName": "primaryColumnSet",
		"propertyName": "items",
		"index": 2
	},
	{
		"operation": "insert",
		"name": "statusColumnSet",
		"values": {
			"items": [],
			"rows": 1,
			"entitySchemaName": "Activity",
			"caption": "statusColumnSetActivity_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "54fde87c-327c-46be-9d2a-2eb68f8f62fd",
		"values": {
			"row": 0,
			"content": "Состояние",
			"columnName": "Status",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "statusColumnSet",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "f319f679-571d-4300-a714-8316a4216975",
		"values": {
			"row": 1,
			"content": "Результат",
			"columnName": "Result",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "statusColumnSet",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "4fd1d084-20fb-46f7-a09a-d0ee7fd26bf0",
		"values": {
			"row": 2,
			"content": "Результат подробно",
			"columnName": "DetailedResult",
			"dataValueType": 1,
			"operation": "insert"
		},
		"parentName": "statusColumnSet",
		"propertyName": "items",
		"index": 2
	},
	{
		"operation": "insert",
		"name": "additionalColumnSet",
		"values": {
			"items": [],
			"rows": 1,
			"entitySchemaName": "Activity",
			"caption": "additionalColumnSetActivity_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 2
	},
	{
		"operation": "insert",
		"name": "9d28fe00-830e-4dbe-b1ca-c7f4a3ecfcb0",
		"values": {
			"row": 0,
			"content": "Категория",
			"columnName": "ActivityCategory",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "additionalColumnSet",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "224f063c-cc4e-421a-b87f-cb7e4d5b71ae",
		"values": {
			"row": 1,
			"content": "Приоритет",
			"columnName": "Priority",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "additionalColumnSet",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "bd3ac2c8-aa40-4d3a-b4a4-26574c412fe8",
		"values": {
			"row": 2,
			"content": "Ответственный",
			"columnName": "Owner",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "additionalColumnSet",
		"propertyName": "items",
		"index": 2
	},
	{
		"operation": "insert",
		"name": "relationsColumnSet",
		"values": {
			"items": [],
			"rows": 1,
			"entitySchemaName": "Activity",
			"caption": "relationsColumnSetActivity_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 3
	},
	{
		"operation": "insert",
		"name": "9342c869-c61c-4273-958b-2f71ee4b2b90",
		"values": {
			"row": 0,
			"content": "Контрагент",
			"columnName": "Account",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "relationsColumnSet",
		"propertyName": "items",
		"index": 0
	},
	{
		"operation": "insert",
		"name": "5a5061ab-b6e6-4706-b587-1d133d603c96",
		"values": {
			"row": 1,
			"content": "Контакт",
			"columnName": "Contact",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "relationsColumnSet",
		"propertyName": "items",
		"index": 1
	},
	{
		"operation": "insert",
		"name": "ActivityParticipantDetailV2EmbeddedDetail",
		"values": {
			"items": [],
			"rows": 1,
			"isDetail": true,
			"filter": {
				"detailColumn": "Activity",
				"masterColumn": "Id"
			},
			"detailSchemaName": "ActivityParticipantDetailV2",
			"entitySchemaName": "ActivityParticipant",
			"caption": "ActivityParticipantDetailV2EmbeddedDetailActivity_caption",
			"operation": "insert"
		},
		"parentName": "settings",
		"propertyName": "columnSets",
		"index": 4
	},
	{
		"operation": "insert",
		"name": "e2c8efab-7aa2-46bc-aac8-158471edf24f",
		"values": {
			"row": 0,
			"content": "Участник",
			"columnName": "Participant",
			"dataValueType": 10,
			"operation": "insert"
		},
		"parentName": "ActivityParticipantDetailV2EmbeddedDetail",
		"propertyName": "items",
		"index": 0
	}
]