define("SysAdminUnitPageV2", ["SysAdminUnitPageV2Resources", "ConfigurationConstants"], function() {
	return {
		details: /**SCHEMA_DETAILS*/{
			ChiefsDetailV2: {
				schemaName: "ChiefsDetailV2",
				filter: {
					masterColumn: "Id",
					detailColumn: "[SysUserInRole:SysUser:Id].[SysAdminUnit:Id:SysRole].Id"
				},
				defaultValues: {
					ConnectionType: {
						masterColumn: "ConnectionType"
					},
					IsParentRoleExist: {
						masterColumn: "IsParentRoleExist"
					}
				}
			},
			SysFuncRoleInOrgRoleDetailV2: {
				filter: {
					detailColumn: "OrgRole"
				}
			},
			SysAdminUnitChiefIPRangeDetailV2: {
				schemaName: "SysAdminUnitChiefIPRangeDetailV2",
				filter: {
					masterColumn: "Id",
					detailColumn: "SysAdminUnit"
				}
			},
			SysFuncRoleChiefInOrgRoleDetailV2: {
				schemaName: "SysFuncRoleChiefInOrgRoleDetailV2",
				filter: {
					masterColumn: "Id",
					detailColumn: "OrgRole"
				}
			}
		}/**SCHEMA_DETAILS*/,
		diff: /**SCHEMA_DIFF*/[
			{
				"operation": "remove",
				"name": "ViewOptionsButton"
			},
			{
				"operation": "remove",
				"name": "PrintButton"
			},
			{
				"operation": "insert",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 0,
				"name": "UsersTab",
				"values": {
					"caption": {"bindTo": "Resources.Strings.UsersTabCaption"},
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "UsersTab",
				"propertyName": "items",
				"name": "UsersDetailV2",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.DETAIL
				}
			},
			{
				"operation": "insert",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 1,
				"name": "ChiefsTab",
				"values": {
					"caption": {"bindTo": "Resources.Strings.ChiefsTabCaption"},
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "ChiefsTab",
				"name": "ChiefsControlGroup",
				"propertyName": "items",
				"index": 0,
				"values": {
					"itemType": this.Terrasoft.ViewItemType.CONTROL_GROUP,
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "ChiefsControlGroup",
				"propertyName": "items",
				"name": "ChiefExist",
				"values": {
					"bindTo": "IsChiefRoleExist",
					"contentType": this.Terrasoft.ContentType.BOOLEAN,
					"layout": {
						"column": 0,
						"row": 0,
						"colSpan": 10
					},
					"labelConfig": {
						"caption": {"bindTo": "Resources.Strings.ExistChiefsRoleCaption"}
					}
				}
			},
			{
				"operation": "insert",
				"name": "GroupName",
				"parentName": "ChiefsControlGroup",
				"propertyName": "items",
				"values": {
					"visible": true,
					"enabled": {"bindTo": "IsGroupNameEnable"},
					"dataValueType": this.Terrasoft.DataValueType.TEXT,
					"caption": {"bindTo": "Resources.Strings.NameChiefRolesCaption"},
					"value": {"bindTo": "GroupName"}
				}
			},
			{
				"operation": "insert",
				"parentName": "ChiefsTab",
				"propertyName": "items",
				"name": "ChiefsDetailV2",
				"values": {"itemType": this.Terrasoft.ViewItemType.DETAIL}
			},
			{
				"operation": "insert",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 2,
				"name": "FuncRolesTab",
				"values": {
					"caption": {"bindTo": "Resources.Strings.RolesTabCaption"},
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "FuncRolesTab",
				"propertyName": "items",
				"name": "SysFuncRoleInOrgRoleDetailV2",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.DETAIL
				}
			},
			{
				"operation": "insert",
				"parentName": "FuncRolesTab",
				"propertyName": "items",
				"name": "SysFuncRoleChiefInOrgRoleDetailV2",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.DETAIL
				}
			},
			{
				"operation": "insert",
				"parentName": "Tabs",
				"propertyName": "tabs",
				"index": 3,
				"name": "IPRangeTab",
				"values": {
					"caption": {"bindTo": "Resources.Strings.IPRangeTabCaption"},
					"items": []
				}
			},
			{
				"operation": "insert",
				"parentName": "IPRangeTab",
				"propertyName": "items",
				"name": "SysAdminUnitIPRangeDetailV2",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.DETAIL
				}
			},
			{
				"operation": "insert",
				"parentName": "IPRangeTab",
				"propertyName": "items",
				"name": "SysAdminUnitChiefIPRangeDetailV2",
				"values": {
					"itemType": this.Terrasoft.ViewItemType.DETAIL
				}
			}
		]/**SCHEMA_DIFF*/,
		attributes: {
			/**
			 * Флаг, показывающий наличие роли руководителей для текущей организационной роли.
			 */
			"IsChiefRoleExist": {
				"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				"dataValueType": this.Terrasoft.DataValueType.BOOLEAN,
				dependencies: [
					{
						columns: ["IsChiefRoleExist"],
						methodName: "onIsChiefRoleExistChange"
					}
				]
			},
			/**
			 * Флаг, используемый для определения того, кто выполнил изменение IsChiefRoleExist, если true - то
			 * пользователь, если false - программное изменение.
			 */
			"IsUserClickCheckbox": {
				"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				"dataValueType": this.Terrasoft.DataValueType.BOOLEAN
			},
			"GroupName": {
				"type": this.Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				"dataValueType": this.Terrasoft.DataValueType.TEXT
			},
			/**
			 * Флаг, определяющий будет ли доступно для редактирования поле с названием группы руководителей.
			 */
			"IsGroupNameEnable": {"dataValueType": this.Terrasoft.DataValueType.BOOLEAN}
		},
		methods: {
			/**
			 * @inheritdoc BasePageV2#reloadEntity
			 * @overridden
			 */
			reloadEntity: function() {
				this.set("IsUserClickCheckbox", false);
				this.set("IsChiefRoleExist", null);
				this.callParent(arguments);
			},

			/**
			 * Обрабатывает событие изменения состояния checkbox, отвечающего за создание/удаление роли
			 * руководителя. Основываясь на IsUserClickCheckbox определяет, кто выполнил изменение состояния
			 * контрола, если true - то пользователь, в противном случае произошла инициализация атрибута и
			 * выполнять какие-либо действия не стоит.
			 * @protected
			 */
			onIsChiefRoleExistChange: function() {
				if (!this.get("IsUserClickCheckbox")) {
					this.set("IsUserClickCheckbox", true);
					return;
				}
				if (this.isNewMode()) {
					this.save({
						isSilent: true,
						callback: this.updateChiefDetail,
						callBaseSilentSavedActions: true
					});
					return;
				}
				if (this.get("IsChiefRoleExist")) {
					this.addChiefsRole();
				} else {
					this.checkCanRemoveChiefsRole();
				}
			},

			/**
			 * Выполняет обновление детали руководителей после того, как была сохранена новая организационная роль.
			 * @protected
			 */
			updateChiefDetail: function() {
				this.sandbox.publish("UpdateChiefDetail", null, [this.getDetailId("ChiefsDetailV2")]);
			},

			/**
			 * Выполняет обращение к сервису для получения количества пользователей в текущей группе руководителей.
			 * @protected
			 */
			checkCanRemoveChiefsRole: function() {
				var chiefData = this.get("ChiefData");
				var dataSend = {
					roleId: chiefData.Id
				};
				var config = {
					serviceName: "AdministrationService",
					methodName: "GetUsersCount",
					data: dataSend
				};
				this.callService(config, this.onCheckCanRemoveChiefsRoleResponse, this);
			},

			/**
			 * Обрабатывает результат запроса для получения количества пользователей в текущей группе. Если в
			 * группе есть пользователи, то мы выводим сообщение о невозможности удалить группу и возвращаем в
			 * изначальное состояние checkbox. Если же в группе руководителей нет пользователей, то выполняет
			 * вывод диалогового окна для подтверждения удаления.
			 * @param {Object} response Ответ от сервиса.
			 * @protected
			 */
			onCheckCanRemoveChiefsRoleResponse: function(response) {
				if (response && !this.Ext.isEmpty(response.GetUsersCountResult)) {
					if (response.GetUsersCountResult === 0) {
						this.showConfirmationDialog(this.get("Resources.Strings.DeleteConfirmationMessage"),
							this.handleDialogResponse,
							[
								this.Terrasoft.MessageBoxButtons.YES.returnCode,
								this.Terrasoft.MessageBoxButtons.NO.returnCode
							],
							null);

					} else {
						this.showInformationDialog(this.get("Resources.Strings.DeletionErrorMessage"));
						this.setCheckboxState(true);
					}
					this.set("ServiceDataLoaded", true);
				}
			},

			/**
			 * Обрабатывает выбор пользователя в диалоговом окне для подтверждения удаления группы руководителей.
			 * Если пользователь подтвердил удаление, то выполняем удаление, если нет - то возвращаем checkbox в
			 * состояние 'checked'.
			 * @param {String} returnCode Tag кнопки, которую выбрал пользователь.
			 * @protected
			 */
			handleDialogResponse: function(returnCode) {
				if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
					this.removeChiefsRole();
				} else {
					this.setCheckboxState(true);
				}
			},

			/**
			 * Устанавливает значение для атрибута IsChiefRoleExist так, чтобы при обработке изменения состояния
			 * не выполнялось добавление/удаление группы руководителей.
			 * @param {Boolean} value Значение, которое будет установлено в атрибут IsChiefRoleExist.
			 * @protected
			 */
			setCheckboxState: function(value) {
				if (this.get("IsChiefRoleExist") !== value) {
					this.set("IsUserClickCheckbox", false);
					this.set("IsChiefRoleExist", value);
				}
			},

			/**
			 * Удаляет текущую группу руководителей.
			 * @protected
			 */
			removeChiefsRole: function() {
				var chiefData = this.get("ChiefData");
				this.callService({
					serviceName: "GridUtilitiesService",
					methodName: "DeleteRecords",
					data: {
						primaryColumnValues: [chiefData.Id],
						rootSchema: this.entitySchema.name
					}
				}, this.onRemoveChiefsRole, this);
			},

			/**
			 * Выполняет обработку ответа сервиса после удаления группы.
			 * @param {Object} responseObject Ответ сервиса.
			 * @protected
			 */
			onRemoveChiefsRole: function(responseObject) {
				var result = this.Ext.decode(responseObject.DeleteRecordsResult);
				var success = result.Success;
				this.hideBodyMask();
				if (!success) {
					this.showInformationDialog(this.get("Resources.Strings.DependencyWarningMessage"));
				}
				this.publishUpdateChiefDetailAndSave();
			},

			/**
			 * Выполняет добавление роли руководителя для текущей организационной роли.
			 * @protected
			 */
			addChiefsRole: function() {
				var dataSend = {
					id: this.get("Id"),
					name: this.get("Name")
				};
				var config = {
					serviceName: "AdministrationService",
					methodName: "SaveChiefsRole",
					data: dataSend
				};
				this.callService(config, this.onAddChiefsRole, this);
			},

			/**
			 * Обрабатывает ответ сервиса после добавления группы руководителей.
			 * @param {Object} response Ответ от сервиса.
			 * @protected
			 */
			onAddChiefsRole: function(response) {
				response = this.Ext.decode(response.SaveChiefsRoleResult);
				this.validateServiceResponse(response, response.message, this.publishUpdateChiefDetailAndSave,
					this);
			},

			/**
			 * Публикует событие для того, чтобы обновить деталь для группы руководителей и сохраняет страницу.
			 * @protected
			 */
			publishUpdateChiefDetailAndSave: function() {
				this.updateChiefDetail();
				this.save({isSilent: true});
			},

			/**
			 * @inheritdoc SysAdminUnitRoleBasePageV2#saveEntity
			 * @overridden
			 */
			saveEntity: function() {
				if (this.changedValues.GroupName) {
					this.onGroupNameChange();
				}
				this.callParent(arguments);
			},

			/**
			 * Проверяет ответ сервиса и оповещает пользователя в случае наличия ошибок.
			 * @protected
			 * @param {string} response Валидируемый ответ сервиса.
			 * @param {string} message Сообщение в случае ошибки.
			 * @param {Function} callback Функция обратного вызова в случае отсутствия ошиибок.
			 * @param {Object} scope  Контекст функции обратного вызова.
			 */
			validateServiceResponse: function(response, message, callback, scope) {
				this.hideBodyMask();
				if (response.success) {
					callback.call(scope);
				} else {
					this.showInformationDialog(message);
				}
			},

			/**
			 * Обрабатывает изменения значения имени подразделения руководителей. Выполняет обновление имени
			 * в базе.
			 * @protected
			 */
			onGroupNameChange: function() {
				var chiefData = this.get("ChiefData");
				if (chiefData) {
					chiefData.Name = this.get("GroupName");
					var dataSend = {
						jsonObject: this.Ext.encode(chiefData)
					};
					var config = {
						serviceName: "AdministrationService",
						methodName: "SaveRole",
						data: dataSend
					};
					this.callService(config, this.onGroupNameSave, this);
				}
			},

			/**
			 * Обрабатывает результат сохранения нового имени для группы руководителей. Выводит сообщение, в случае
			 * не успешного сохранения.
			 * @param {Object} response Ответ от сервера.
			 */
			onGroupNameSave: function(response) {
				if (response && response.SaveRoleResult) {
					var result = this.Ext.decode(response.SaveRoleResult);
					if (!result.success) {
						this.showInformationDialog(result.message);
					}
				}
			},

			/**
			 * @inheritdoc GridUtilitiesV2#init
			 * @overridden
			 */
			init: function() {
				this.callParent(arguments);
				this.selectChiefsUnits();
			},

			/**
			 * Добавляет подписчика для события, который будет обновлять сведенья о группе руководителей для
			 * текущего подразделения.
			 * @protected
			 */
			selectChiefsUnits: function() {
				this.sandbox.subscribe("GetChiefsSysAdminUnits", function(result) {
					this.set("updatedFromDetail", true);
					this.set("ChiefData", result);
					this.set("GroupName", result ? result.Name : "");
					var chiefRoleExist = !this.Ext.isEmpty(result);
					this.setCheckboxState(chiefRoleExist);
					this.set("IsGroupNameEnable", chiefRoleExist);
					delete this.changedValues.GroupName;
				}, this, [this.getDetailId("ChiefsDetailV2")]);
			},

			/**
			 * Возвращает заголовок страницы
			 * @protected
			 * @virtual
			 */
			getHeader: function() {
				return this.get("Resources.Strings.HeaderCaption");
			}
		},
		messages: {
			"GetChiefsSysAdminUnits": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.SUBSCRIBE
			},
			"UpdateChiefDetail": {
				mode: this.Terrasoft.MessageMode.PTP,
				direction: this.Terrasoft.MessageDirectionType.PUBLISH
			}
		}
	};
});
