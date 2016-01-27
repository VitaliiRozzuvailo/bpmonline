define("DesignTimeEnums", ["ext-base", "terrasoft", "DesignTimeEnumsResources"],
	function() {
		Ext.ns("Terrasoft.DesignTimeEnums");

		/**
		 * @enum
		 * Уникальные идентификаторы базовых схем
		 */
		Terrasoft.DesignTimeEnums.BaseSchemaUId = {
			/**
			 * Базовый объект
			 */
			BASE_ENTITY: "1bab9dcf-17d5-49f8-9536-8e0064f1dce0",
			/**
			 * Базовая группа
			 */
			BASE_FOLDER: "d602bf96-d029-4b07-9755-63c8f5cb5ed5",
			/**
			 * Базовый файл
			 */
			BASE_FILE: "556c5867-60a7-4456-aae1-a57a122bef70",
			/**
			 * Базовый справочник
			 */
			BASE_LOOKUP: "11ab4bcb-9b23-4b6d-9c86-520fae925d75",
			/**
			 * Базовый элемент в группе
			 */
			BASE_ITEM_IN_FOLDER: "4f63bafb-e9e7-4082-b92e-66b97c14017c",
			/**
			 *Базовая схема раздела
			 */
			BASE_SECTION: "7912fb69-4fee-429f-8b23-93943c35d66d",
			/**
			 *Базовая схема страницы редактирования модуля
			 */
			BASE_MODULE_PAGE: "8a1b1d92-7d06-4ae7-865c-98224263ddb1",
			/**
			 *Базовая схема страницы редактирования
			 */
			BASE_PAGE: "d3cc497c-f286-4f13-99c1-751c468733c0",
			/**
			 *Базовая схема детали с реестром
			 */
			BASE_GRID_DETAIL: "01eb38ee-668a-42f0-999d-c2534f979089"
		};

		/**
		 * @enum
		 * URL мастеров
		 */
		Terrasoft.DesignTimeEnums.WizardUrl = {
			/**
			 * URL мастера детали
			 */
			DETAIL_WIZARD_URL: "/NUI/ViewModule.aspx?vm=DetailWizard#"
		};
	}
);