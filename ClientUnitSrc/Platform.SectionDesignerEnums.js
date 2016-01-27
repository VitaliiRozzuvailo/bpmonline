define("SectionDesignerEnums", ["ext-base", "terrasoft", "SectionDesignerEnumsResources"],
	function() {
		return {

			/**
			 * Тип модификации
			 */
			ModificationType: {
				NEW: 0,
				MODIFIED: 1,
				DELETED: 2
			},

			/**
			 * Типи использования груп раздела
			 */
			ModuleFolderType: {
				MultiFolderEntry: "B659D704-3955-E011-981F-00155D043204",
				SingleFolderEntry: "C6E5C331-3955-E011-981F-00155D043204",
				None: "A24A734D-3955-E011-981F-00155D043204"
			},

			/**
			 * Константы UId служебных схем
			 */
			SectionSchemaIds: {
				SectionModuleSchemaUId: "DF58589E-26A6-44D1-B8D4-EDF1734D02B4",
				CardModuleUId: "4E1670DC-10DB-4217-929A-669F906E5D75"
			},

			/**
			 * Идентификаторы кололнок для локализации
			 */
			SysModuleEditLczColumns: {
				ActionKindCaption: "A19BF4BF-E22B-49B5-B6E0-918FF6290020",
				PageCaption: "55132174-2B96-4E0A-830C-B8E952B12C45"
			},

			/**
			 * Идентификаторы кололнок для локализации
			 */
			SysModuleLczColumns: {
				Header: "7B904E78-84BF-408C-A7A1-1287E66837D3",
				Caption: "3DA3C3B2-02FB-4CCA-80C3-7946D4E8F565"
			},

			/**
			 * Идентификатор рабочего места
			 */
			TempSysModuleFolderId: "F330F0C2-3EE4-4A73-9AC9-8439543CA19B",

			/**
			 * Тип клиентской схемы
			 */
			ClientUnitSchemaType: {
				/**
				 * Модуль
				 */
				Module: 1,
				/**
				 * Схема представления модели карточки
				 */
				EditViewModelSchema: 2,
				/**
				 * Схема представления модели раздела
				 */
				ModuleViewModelSchema: 3,
				/**
				 * Схема представления модели детали
				 */
				DetailViewModelSchema: 4,
				/**
				 * Схема представления модели детали с реестром
				 */
				GridDetailViewModelSchema: 5,
				/**
				 * Схема представления модели детали с полями
				 */
				EditControlsDetailViewModelSchema: 6
			},

			/**
			 * Результат выполнения шага
			 */
			StepType: {
				/**
				 * Следующий шаг
				 */
				NEXT: 0,
				/**
				 * Предыдущий шаг
				 */
				PREV: 1,
				/**
				 * Завершающая страница
				 */
				FINISH: 2,
				/**
				 * Выход из дизайнера
				 */
				EXIT: 3
			},

			/**
			 * Уникальные идентификаторы базовых схем
			 */
			BaseSchemeUIds: {
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
				 * Базовый тег
				 */
				BASE_TAG: "9e3f203c-e905-4de5-9468-335b193f2439",
				/**
				 * Базовый тег в объекте
				 */
				BASE_ENTITY_IN_TAG: "5894a2b0-51d5-419a-82bb-238674634270",
				/**
				 *Базовая схема раздела
				 */
				BASE_SECTION: "7912fb69-4fee-429f-8b23-93943c35d66d",
				/**
				 *Базовая схема страницы редактирования
				 */
				BASE_PAGE: "8a1b1d92-7d06-4ae7-865c-98224263ddb1",
				/**
				 *Базовая схема детали с реестром
				 */
				BASE_GRID_DETAIL: "01eb38ee-668a-42f0-999d-c2534f979089"
			},

			BaseClientUnitSchemeNames: {
				/**
				 * Имя базовой схемы страницы редактирования
				 */
				BASE_PAGE_NAME: "BaseModulePageV2",
				/**
				 * Имя базовой схемы страницы редактирования
				 */
				BASE_SECTION_NAME: "BaseSectionV2",
				/**
				 * Имя базовой схемы детали с реестром
				 */
				BASE_GRID_NAME: "BaseGridDetailV2"
			},

			SchemaPackageStatus: {
				NOT_EXISTS: 0,
				NOT_EXISTS_IN_CURRENT_PACKAGE: 1,
				EXISTS_IN_CURRENT_PACKAGE: 2
			}

		};
	}
);