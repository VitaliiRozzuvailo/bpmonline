define("ActivityParticipantDetailV2", ["ConfigurationConstants", "ConfigurationEnums"],
	function(ConfigurationConstants, configurationEnums) {
		return {
			entitySchemaName: "ActivityParticipant",
			methods: {
				/**
				 * Возвращает колонки, которые всегда выбираются запросом
				 * @return {Object} Возвращает массив объектов-конфигураций колонок
				 */
				getGridDataColumns: function() {
					return {
						"Id": { path: "Id" },
						"Participant": { path:  "Participant" },
						"Participant.Name": { path: "Participant.Name"},
						"Participant.JobTitle": { path:  "Participant.JobTitle" },
						"Participant.Phone": { path:  "Participant.Phone" },
						"Participant.MobilePhone": { path:  "Participant.MobilePhone" },
						"Participant.Email": { path:  "Participant.Email" },
						"Role": { path:  "Role" }
					};
				},

				/**
				 * Открывает справочник контактов
				 * @private
				 */
				openContactLookup: function() {
					var Ext = this.Ext;
					var Terrasoft = this.Terrasoft;
					var activityId = this.get("MasterRecordId");
					var roleId = ConfigurationConstants.Activity.ParticipantRole.Participant;
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: this.entitySchemaName
					});
					esq.addColumn("Id");
					esq.addColumn("Participant.Id", "ContactId");
					esq.filters.add("filterActivity", Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "Activity", activityId));
					esq.filters.add("filterRole", this.Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, "Role", roleId));
					esq.getEntityCollection(function(result) {
						var existsContactsCollection = [];
						if (result.success) {
							result.collection.each(function(item) {
								existsContactsCollection.push(item.get("ContactId"));
							});
						}
						var config = {
							entitySchemaName: "Contact",
							multiSelect: true,
							columns: ["JobTitle", "MobilePhone", "Email"]
						};
						if (existsContactsCollection.length > 0) {
							var existsFilter = Terrasoft.createColumnInFilterWithParameters("Id",
								existsContactsCollection);
							existsFilter.comparisonType = Terrasoft.ComparisonType.NOT_EQUAL;
							existsFilter.Name = "existsFilter";
							config.filters = existsFilter;
						}
						this.openLookup(config, this.addCallBack, this);
					}, this);
				},

				/**
				 * @overridden
				 */
				onCardSaved: function() {
					this.openContactLookup();
				},

				/*
				* Открывает справочник контактов в случае если карточка активности была ранее сохранена
				* @overridden
				* */
				addRecord: function() {
					var masterCardState = this.sandbox.publish("GetCardState", null, [this.sandbox.id]);
					var isNewRecord = (masterCardState.state === configurationEnums.CardStateV2.ADD ||
						masterCardState.state === configurationEnums.CardStateV2.COPY);
					if (isNewRecord === true) {
						var args = {
							isSilent: true,
							messageTags: [this.sandbox.id]
						};
						this.sandbox.publish("SaveRecord", args, [this.sandbox.id]);
						return;
					}
					this.openContactLookup();
				},

				/*
				* Добавление выбраных контактов как учасников активности
				* @private
				* */
				addCallBack: function(args) {
					var bq = this.Ext.create("Terrasoft.BatchQuery");
					var activityId = this.get("MasterRecordId");
					this.selectedRows = args.selectedRows.getItems();
					this.selectedItems = [];
					this.selectedRows.forEach(function(item) {
						item.ActivityId = activityId;
						bq.add(this.getContactInsertQuery(item));
						this.selectedItems.push(item.value);
					}, this);
					if (bq.queries.length) {
						this.showBodyMask.call(this);
						bq.execute(this.onContactInsert, this);
					}
				},

				/*
				* Возвращает запрос на добавление учасника активности
				* @param args {Object} идентификатор активности и выбранный в справочнике контакт   {ActivityId, value}
				* @private
				* */
				getContactInsertQuery: function(item) {
					var roleId = ConfigurationConstants.Activity.ParticipantRole.Participant;
					var insert = Ext.create("Terrasoft.InsertQuery", {
						rootSchemaName: this.entitySchemaName
					});
					insert.setParameterValue("Activity", item.ActivityId, this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Participant", item.value, this.Terrasoft.DataValueType.GUID);
					insert.setParameterValue("Role", roleId, this.Terrasoft.DataValueType.GUID);
					return insert;
				},

				/*
				* Загрузка добавленых учасников в реестр
				* @private
				* */
				onContactInsert: function(response) {
					this.hideBodyMask.call(this);
					if (this.get("IsGridLoading")) {
						return;
					}
					this.beforeLoadGridData();
					var filterCollection = [];
					response.queryResults.forEach(function(item) {
						filterCollection.push(item.id);
					});
					var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: this.entitySchemaName
					});
					this.initQueryColumns(esq);
					esq.filters.add("recordId", Terrasoft.createColumnInFilterWithParameters("Id", filterCollection));
					esq.getEntityCollection(function(response) {
						this.afterLoadGridData();
						if (response.success) {
							var responseCollection = response.collection;
							this.prepareResponseCollection(responseCollection);
							this.getGridData().loadAll(responseCollection);
						}
					}, this);
				},

				/*
				 * Удаление выбранных записей, кроме тех в которых роль - Ответственный
				 * @overridden
				 * */
				deleteRecords: function() {
					var selectedRows = this.getSelectedItems();
					var deleteRows = [];
					var gridData = this.getGridData();
					var roleId = ConfigurationConstants.Activity.ParticipantRole.Responsible;
					var isResponsibleExists = false;
					selectedRows.forEach(function(rowId) {
						var row = gridData.get(rowId);
						if (this.Ext.isEmpty(row.values.Role) || (row.values.Role.value !== roleId)) {
							deleteRows.push(rowId);
						} else {
							isResponsibleExists = true;
						}
					}, this);
					if (isResponsibleExists) {
						this.showInformationDialog(this.get("Resources.Strings.WarningResponsibleDelete"));
					}
					if (deleteRows.length > 0) {
						this.set("SelectedRows", deleteRows);
						this.callParent(arguments);
					}
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
				getEditRecordMenuItem: Terrasoft.emptyFn,

				/**
				 * Возвращает имя колонки для фильтрации по умолчанию.
				 * @overridden
				 * @return {String} Имя колонки.
				 */
				getFilterDefaultColumnName: function() {
					return "Participant";
				}

			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "merge",
					"name": "DataGrid",
					"values": {
						"type": "listed",
						"primaryDisplayColumnName": "Participant.Name",
						"listedConfig": {
							"name": "DataGridListedConfig",
							"items": [
								{
									"name": "ParticipantListedGridColumn",
									"bindTo": "Participant",
									"position": {
										"column": 1,
										"colSpan": 12
									}
								},
								{
									"name": "ParticipantJobTitleListedGridColumn",
									"bindTo": "Participant.JobTitle",
									"position": {
										"column": 13,
										"colSpan": 12
									}
								},
								{
									"name": "RoleListedGridColumn",
									"bindTo": "Role",
									"position": {
										"column": 25,
										"colSpan": 8
									}
								},
								{
									"name": "ParticipantPhoneListedGridColumn",
									"bindTo": "Participant.Phone",
									"position": {
										"column": 33,
										"colSpan": 8
									}
								},
								{
									"name": "ParticipantMobilePhoneListedGridColumn",
									"bindTo": "Participant.MobilePhone",
									"position": {
										"column": 41,
										"colSpan": 8
									}
								},
								{
									"name": "ParticipantEmailListedGridColumn",
									"bindTo": "Participant.Email",
									"position": {
										"column": 49,
										"colSpan": 8
									}
								}
							]
						},
						"tiledConfig": {
							"name": "DataGridTiledConfig",
							"grid": {
								"columns": 24,
								"rows": 3
							},
							"items": [
								{
									"name": "ParticipantTiledGridColumn",
									"bindTo": "Participant",
									"position": {
										"row": 1,
										"column": 1,
										"colSpan": 12
									}
								},
								{
									"name": "ParticipantJobTitleTiledGridColumn",
									"bindTo": "Participant.JobTitle",
									"position": {
										"row": 1,
										"column": 13,
										"colSpan": 12
									}
								},
								{
									"name": "RoleTiledGridColumn",
									"bindTo": "Role",
									"position": {
										"row": 1,
										"column": 25,
										"colSpan": 8
									}
								},
								{
									"name": "ParticipantPhoneTiledGridColumn",
									"bindTo": "Participant.Phone",
									"position": {
										"row": 1,
										"column": 33,
										"colSpan": 8
									}
								},
								{
									"name": "ParticipantMobilePhoneTiledGridColumn",
									"bindTo": "Participant.MobilePhone",
									"position": {
										"row": 1,
										"column": 41,
										"colSpan": 8
									}
								},
								{
									"name": "ParticipantEmailTiledGridColumn",
									"bindTo": "Participant.Email",
									"position": {
										"row": 1,
										"column": 49,
										"colSpan": 8
									}
								}
							]
						}
					}
				},
				{
					"operation": "merge",
					"name": "AddRecordButton",
					"values": {
						"visible": {"bindTo": "getToolsVisible"}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	}
);