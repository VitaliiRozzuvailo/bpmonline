define("MobileDesignerMetadataToManifestConverter", [],
	function() {

		/**
		 * @class Terrasoft.MobileDesignerMetadataToManifestConverter
		 * @public
		 * Класс, преобразующий метаданные дизайнеров в метаданные манифеста.
		 */
		Ext.define("Terrasoft.MobileDesignerMetadataToManifestConverter", {

			//region Properties: Private

			metadata: null,

			designerConfig: null,

			entitySchemaName: null,

			settingsSchemaName: null,

			//endregion

			//region Methods: Private

			/**
			 * @private
			 */
			isInsertOperation: function(metadataItem) {
				return metadataItem.operation === "insert";
			},

			/**
			 * @private
			 */
			isEmbeddedDetailColumn: function(metadataItem) {
				var designerConfig = this.designerConfig;
				var columnSets = designerConfig.columnSets;
				for (var i = 0, ln = columnSets.length; i < ln; i++) {
					var columnSetConfig = columnSets[i];
					if (columnSetConfig.isDetail && metadataItem.parentName === columnSetConfig.name) {
						return true;
					}
				}
				return false;
			},

			/**
			 * @private
			 */
			processGridPageMetadata: function() {
				var gridColumnNames = [];
				var items = this.metadata;
				for (var i = 0, ln = items.length; i < ln; i++) {
					var gridMetadataItem = items[i];
					if (gridMetadataItem.operation === "remove") {
						continue;
					}
					var metadataItemValues = gridMetadataItem.values;
					var columnName = metadataItemValues.columnName;
					if (this.isInsertOperation(gridMetadataItem) && !Ext.isEmpty(columnName)) {
						gridColumnNames.push(columnName);
					}
				}
				this.manifest.setGridPageColumns(this.entitySchemaName, gridColumnNames);
			},

			/**
			 * @private
			 */
			processRecordPageEmbeddedDetails: function() {
				var designerConfig = this.designerConfig;
				var columnSets = designerConfig.columnSets;
				if (!columnSets) {
					return;
				}
				var embeddedDetails = {};
				for (var i = 0, ln = columnSets.length; i < ln; i++) {
					var columnSet = columnSets[i];
					if (columnSet.isDetail) {
						var embeddedDetail = embeddedDetails[columnSet.entitySchemaName] = [];
						embeddedDetail.push(columnSet.filter.detailColumn);
						for (var j = 0, lnj = columnSet.items.length; j < lnj; j++) {
							var columnSetColumn = columnSet.items[j];
							embeddedDetail.push(columnSetColumn.columnName);
						}
					}
				}
				this.manifest.setEmbeddedDetails(this.entitySchemaName, embeddedDetails);
			},

			/**
			 * @private
			 */
			processRecordPageMetadata: function() {
				var items = this.metadata;
				var recordPageColumnNames = [];
				var detailNames = [];
				var details = {};
				for (var i = 0, ln = items.length; i < ln; i++) {
					var metadataItem = items[i];
					if (metadataItem.operation === "remove" || this.isEmbeddedDetailColumn(metadataItem)) {
						continue;
					}
					var metadataItemValues = metadataItem.values;
					var columnName = metadataItemValues.columnName;
					if (metadataItem.propertyName === "details") {
						details[metadataItemValues.entitySchemaName] = [metadataItemValues.filter.detailColumn];
						continue;
					}
					if (metadataItemValues.isDetail) {
						detailNames.push(metadataItem.name);
						continue;
					}
					if (this.isInsertOperation(metadataItem) && !Ext.isEmpty(columnName) &&
						detailNames.indexOf(metadataItem.parentName) === -1) {
						recordPageColumnNames.push(columnName);
					}
				}
				this.manifest.setRecordPageColumns(this.entitySchemaName, recordPageColumnNames);
				this.manifest.setStandartDetails(this.entitySchemaName, details);

				/*
				 HACK: CRM-8103
				 При применении изменений дизайнера в манифест, конфигурация встраеваемых деталей должна обрабатываться
				 по diff-у, а не по метаданным дизайнера
				 */
				this.processRecordPageEmbeddedDetails();

			},

			//endregion

			//region Methods: Public

			/**
			 * Метод преобразующий метаданные дизайнеров в метаданные манифеста.
			 * @param {Object} config Конфигурационный объект с параметрами вызова метода:
			 * @param {Object} config.manifest Объект манифеста.
			 * @param {String} config.entitySchemaName Имя объекта.
			 * @param {String} config.settingsType Тип настройки.
			 * @param {String} config.settingsSchemaName Имя схемы добавляемой в манифест.
			 */
			applyMetadataToManifest: function(config) {
				var manifest = this.manifest = config.manifest;
				this.metadata = config.metadata;
				this.designerConfig = config.designerConfig;
				var entitySchemaName = this.entitySchemaName = config.entitySchemaName;
				var settingsType = config.settingsType;
				manifest.addSettingsPage(entitySchemaName, config.settingsSchemaName);
				if (settingsType === Terrasoft.MobileDesignerEnums.SettingsType.GridPage) {
					this.processGridPageMetadata();
				} else if (settingsType === Terrasoft.MobileDesignerEnums.SettingsType.RecordPage) {
					this.processRecordPageMetadata();
				}
			}

			//endregion

		});

		return Terrasoft.MobileDesignerMetadataToManifestConverter;

	}
);