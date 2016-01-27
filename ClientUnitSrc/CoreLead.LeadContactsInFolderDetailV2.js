define("LeadContactsInFolderDetailV2", ["ext-base", "terrasoft", "sandbox",  "ConfigurationConstants",
		"ConfigurationEnums"],
	function(Ext, Terrasoft, sandbox, ConfigurationConstants, Enums) {
		return {
			entitySchemaName: "ContactInFolder",
			methods: {

				/**
				 * Возвращает колонки, которые всегда выбираются запросом.
				 * @protected
				 * @overriden
				 * @return {Object} Возвращает массив объектов-конфигураций колонок.
				 */
				getGridDataColumns: function() {
					return {
						"Id": { path: "Id" },
						"Folder": { path:  "Folder" }
					};
				},

				/**
				 * Метод действия "Добавить групу контактов".
				 * @private
				 */
				addContactFolder: function() {
					var masterColumnValue = this.get("MasterRecordId");
					var config = {
						entitySchemaName: "ContactFolder",
						multiSelect: true,
						columns: ["FolderType", "Id"]
					};
					var existsFilterGroup = this.Terrasoft.createFilterGroup();
					existsFilterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "Contact", masterColumnValue));
					var existsFilter = this.Terrasoft.createNotExistsFilter("[ContactInFolder:Folder:Id].Contact",
						existsFilterGroup);
					var filterGroup = this.Terrasoft.createFilterGroup();
					filterGroup.addItem(existsFilter);
					var folderFilter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL, "FolderType", ConfigurationConstants.Folder.Type.General);
					filterGroup.addItem(folderFilter);
					config.filters = filterGroup;
					this.openLookup(config, this.addContactCallback, this);
				},

				/**
				 * Callback-функция, выполняющаяся после добавления групп контактов.
				 * @private
				 * @param {Object} args Параметры.
				 */
				addContactCallback: function(args) {
					var bq = this.Ext.create("Terrasoft.BatchQuery");
					var contactId = this.get("MasterRecordId");
					this.selectedRows = args.selectedRows.getItems();
					this.selectedItems = [];
					this.selectedRows.forEach(function(item) {
						item.ContactId = contactId;
						bq.add(this.getContactInsertQuery(item));
						this.selectedItems.push(item.value);
					}, this);
					if (bq.queries.length > 0) {
						bq.execute(function(response) {
							if (response && response.success) {
								this.reloadGridData();
							}
						}, this);
					}
				},

				/*
				 * Возвращает запрос на добавление контакта в статическую группу.
				 * @param args {Object} Идентификатор контакта и выбранная в справочнике группа {ContactId, value}				 *
				 * @private
				 * return {Object} Инсерт записи.
				 */
				getContactInsertQuery:  function(item) {
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: "ContactInFolder"
					});
					insert.setParameterValue("Contact", item.ContactId, Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Folder", item.value, Terrasoft.DataValueType.GUID);
					return insert;
				},

				/**
				 * Возвращает значение свернутости детали.
				 * @protected
				 * @return {Boolean} Значение свернутости детали.
				 */
				getAddRecordButtonVisible: function() {
					return this.getToolsVisible();
				},

				/**
				 * Добавляет выбранную группу из справочника.
				 * @protected
				 * @overriden
				 */
				addRecord: function() {
					var cardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
					var isNew = (cardState.state === Enums.CardStateV2.ADD ||
						cardState.state === Enums.CardStateV2.COPY);
					if (isNew) {
						this.set("CardState", Enums.CardStateV2.ADD);
						var args = {
							isSilent: true,
							messageTags: [this.sandbox.id]
						};
						this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
					} else {
						this.addContactFolder();
					}
				},

				/**
				 * Вызывает метод добавления контактов в группы после сохранения карточки.
				 * @protected
				 * @overridden
				 */
				onCardSaved: function() {
					this.addContactFolder();
				},

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getCopyRecordMenuItem
				 * @overridden
				 */
				getCopyRecordMenuItem: Terrasoft.emptyFn,

				/**
				 * @inheritdoc Terrasoft.BaseGridDetailV2#getEditRecordMenuItem
				 * @overridden
				 */
				getEditRecordMenuItem: Terrasoft.emptyFn
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "AddRecordButton",
					"parentName": "Detail",
					"propertyName": "tools",
					"values": {
						"itemType": Terrasoft.ViewItemType.BUTTON,
						"click": {"bindTo": "addContactFolder"},
						"visible": {"bindTo": "getAddRecordButtonVisible"},
						"enabled": {"bindTo": "getAddRecordButtonEnabled"}
					}
				}
			] /**SCHEMA_DIFF*/
		};
	});
