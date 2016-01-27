define("BaseModulePageV2", ["ConfigurationEnums", "NotesUtilities", "TagUtilitiesV2"], function(ConfigurationEnums) {
	return {
		attributes: {
			"NotesImagesCollection": {dataValueType: Terrasoft.DataValueType.COLLECTION},

			/**
			 * Флаг, указываюший доступность работы с тегами
			 */
			"UseTagModule": {
				dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
				value: true
			}
		},
		mixins: {
			NotesUtilities: "Terrasoft.NotesUtilities",
			TagUtilities: "Terrasoft.TagUtilities"
		},
		messages: {
			/**
			 * @message TagChanged
			 * Обновляет количество тегов в кнопке.
			 */
			"TagChanged": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
			},

			/**
			 * @message GetRecordId
			 * Возвращает идентификатор записи, которая редактируется.
			 */
			"GetRecordId": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "insert",
				"parentName": "LeftContainer",
				"propertyName": "items",
				"name": "TagButton",
				"values": {
					"itemType": Terrasoft.ViewItemType.BUTTON,
					"caption": {"bindTo": "TagButtonCaption"},
					"imageConfig": {"bindTo": "Resources.Images.TagButtonIcon"},
					"click": {"bindTo": "onTagButtonClick"},
					"classes": {
						"textClass": ["actions-button-margin-right"],
						"wrapperClass": ["actions-button-margin-right"]
					},
					"visible": {"bindTo": "TagButtonVisible"}
				}
			}
		]/**SCHEMA_DIFF*/,
		methods: {
			/**
			 * @inheritdoc Terrasoft.BasePageV2#onPageInitialized
			 * @overridden
			 */
			onPageInitialized: function(callback, scope) {
				this.callParent([function() {
					this.mixins.NotesUtilities.initNotesImagesCollection.call(this);
					this.initTags(this.entitySchemaName);
					callback.call(scope);
				}, this]);
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#onEntityInitialized
			 * @overridden
			 */
			onEntityInitialized: function() {
				this.callParent(arguments);
				if (this.get("IsSeparateMode")) {
					this.initTagButton();
				}
			},

			/**
			 * @inheritdoc Terrasoft.BasePageV2#subscribeSandboxEvents
			 * @overridden
			 */
			subscribeSandboxEvents: function() {
				this.callParent(arguments);
				this.sandbox.subscribe("TagChanged", this.reloadTagCount, this, [this.getTagModuleSandboxId()]);
				this.sandbox.subscribe("GetRecordId", function() {
					return this.getCurrentRecordId();
				}, this, [this.sandbox.id]);
			},

			/**
			 * Формирует Id модуля тегов
			 * @returns {string}
			 * @private
			 */
			getTagModuleSandboxId: function() {
				return this.sandbox.id + "_TagModule";
			},

			/**
			 * Обработчик события старта загрузки файлов. Отображает маску загрузки.
			 * Реализует интерфейс миксина Terrasoft.NotesUtilities.
			 * @protected
			 */
			onNotesImagesUpload: function() {
				this.showBodyMask();
			},

			/**
			 * Обработчик события завершения загрузки файлов. Скрывает маску загрузки.
			 * Реализует интерфейс миксина Terrasoft.NotesUtilities.
			 * @protected
			 */
			onNotesImagesUploadComplete: function() {
				this.hideBodyMask();
				this.updateFileDetail();
			},

			/**
			 * Возвращает название схемы объекта Файл и ссылка раздела.
			 * Реализует интерфейс миксина Terrasoft.NotesUtilities.
			 * @protected
			 * @virtual
			 * @return {String} Название схемы объекта Файл и ссылка раздела.
			 */
			getFileEntitySchemaName: function() {
				return this.entitySchema.name + "File";
			},

			/**
			 * Обновляет деталь "Файлы и ссылки".
			 * @private
			 */
			updateFileDetail: function() {
				this.updateDetail({detail: "Files"});
			},

			/**
			 * Обработчик кнопки "Тег".
			 * @protected
			 */
			onTagButtonClick: function() {
				if (this.isAddMode() || this.isEditMode() || this.isCopyMode()) {
					this.saveCardAndLoadTags();
				} else {
					this.mixins.TagUtilities.showTagModule.call(this);
				}
			},

			/**
			 * Возвращает идентификатор открытой записи.
			 * @overridden
			 * @protected
			 * @return {String} идентификатор записи.
			 */
			getCurrentRecordId: function() {
				return this.get("Id");
			}
		}
	};
});
