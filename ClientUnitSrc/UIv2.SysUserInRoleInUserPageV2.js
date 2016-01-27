define("SysUserInRoleInUserPageV2", ["ConfigurationConstants"],
	function(ConfigurationConstants) {
		return {
			entitySchemaName: "SysUserInRole",
			messages: {
				/**
				 * Сообщает разделу о необходимости вывода сообщения об актуализации ролей.
				 */
				"NeedActualizeRoles": {
					mode: this.Terrasoft.MessageMode.BROADCAST,
					direction: this.Terrasoft.MessageDirectionType.PUBLISH
				}
			},
			attributes: {
				"SysRole": {
					isRequired: true
				}
			},
			methods: {

				/**
				 * Добавляет фильтр для колонки SysRole.
				 * @inheritDoc Terrasoft.BasePageV2#getLookupPageConfig
				 * @overridden
				 */
				getLookupPageConfig: function(args, columnName) {
					var entityColumn = this.entitySchema.getColumnByName(columnName);
					var filters = this.Terrasoft.createFilterGroup();
					if (columnName === "SysRole") {
						filters.addItem(this.getRoleLookupFilter());
						filters.addItem(this.getLookupQueryFilters(columnName));
					}
					var config = {
						entitySchemaName: args.schemaName || entityColumn.referenceSchemaName,
						multiSelect: false,
						columnName: columnName,
						columnValue: this.get(columnName),
						searchValue: args.searchValue,
						filters: filters,
						hideActions: true
					};
					this.Ext.apply(config, this.getLookupListConfig(columnName));
					return config;
				},

				/**
				 * @inheritDoc Terrasoft.BasePageV2#getLookupQuery
				 * @overridden
				 */
				getLookupQuery: function(filterValue, columnName) {
					var esq = this.callParent(arguments);
					esq.filters.addItem(this.getRoleLookupFilter(columnName));
					return esq;
				},

				/**
				 * Формирует данные для вызова сервиса.
				 * @private
				 * @return {Object} Возвращает объект с данными для сервиса.
				 */
				getSaveServiceDataSend: function() {
					var sysRoleId = !this.Ext.isEmpty(this.get("SysRole")) ? this.get("SysRole").value : null;
					var userId = !this.Ext.isEmpty(this.get("SysUser")) ? this.get("SysUser").value : null;
					var recordId = !this.isNew ? this.get("Id") : null;
					var dataSend = {
						recordId: recordId,
						roleId: sysRoleId,
						userId: userId
					};
					return dataSend;
				},

				/**
				 * Формирует параметры для вызова сервиса
				 * @private
				 * @return {Object} Возвращает объект с параметрами для сервиса.
				 */
				getSaveServiceConfig: function(dataSend) {
					var config = {
						serviceName: "AdministrationService",
						methodName: "SaveUsersInRole",
						data: dataSend
					};
					return config;
				},

				/**
				 * Публикует сообщение о необходимости выполнить актуализацию ролей.
				 */
				publishNeedActualizeRolesMessage: function() {
					this.sandbox.publish("NeedActualizeRoles");
				},

				/**
				 * Callback - функция метода сохранения записи.
				 * @private
				 * @param {Object} response Ответ метода сервиса.
				 */
				saveServiceCallback: function(response) {
					if (response) {
						this.publishNeedActualizeRolesMessage();
						response.success = this.Ext.isEmpty(response.SaveUsersInRoleResult);
						response.id = response.SaveUsersInRoleResult;
						response.rowsAffected = 1;
						response.nextPrcElReady = false;
						this.isNew = false;
						this.changedValues = null;
						if (!this.Ext.isEmpty(response.SaveUsersInRoleResult)) {
							this.showInformationDialog(response.SaveUsersInRoleResult);
						}
					}
				},

				/**
				 * Сохраняет сущность на сервере. Если сущность уже существует быдет выполнено обновление данных, иначе -
				 * добавление новой сущности.
				 * @param {Function} callback Функция, которая будет вызвана при получении ответа от сервера.
				 * @param {Object} scope Контекст, в котором будет вызвана функция callback.
				 * @inheritDoc Terrasoft.BaseViewModel#saveEntity
				 * @overridden
				 */
				saveEntity: function(callback, scope) {
					var dataSend = this.getSaveServiceDataSend();
					var config = this.getSaveServiceConfig(dataSend);
					this.showBodyMask();
					this.callService(config, function(response) {
						this.saveServiceCallback(response);
						callback.call(scope || this, response);
					}, scope || this);
				},

				/**
				 * Получает атрибут с именем SysUser из массива значений по-умолчанию,
				 * если атрибут SysUser еще не определен в модели.
				 * @return {Object} Объект с именем SysUser и значением Id текущего пользователя.
				 */
				getUser: function() {
					var user = this.get("SysUser");
					if (this.Ext.isEmpty(user)) {
						var defaultValues = this.get("DefaultValues");
						defaultValues.forEach(function(item) {
							if (item.name === "SysUser") {
								user = item;
							}
						});
					}
					return user;
				},

				/**
				 * Формирует фильтры, для отображения ролей необходимого типа (функциональные или организационные)
				 * в зависимости от типа детали
				 * @private
				 * @return {Terrasoft.data.filters.FilterGroup} Возвращает группу фильтров.
				 */
				getRoleLookupFilter: function() {
					var filters = this.Terrasoft.createFilterGroup();
					var sysAdminUnitTypes = [];
					var callChain = this.Ext.id.split("_");
					switch (callChain.pop()) {
						case "SysFuncRoleInUserDetailV2":
							sysAdminUnitTypes = [
								ConfigurationConstants.SysAdminUnit.Type.FuncRole
							];
							break;
						case "SysOrgRoleInUserDetailV2":
							sysAdminUnitTypes = [
								ConfigurationConstants.SysAdminUnit.Type.Organisation,
								ConfigurationConstants.SysAdminUnit.Type.Department,
								ConfigurationConstants.SysAdminUnit.Type.Manager,
								ConfigurationConstants.SysAdminUnit.Type.Team
							];
							break;
						default :
							break;
					}
					var typeFilter = this.Terrasoft.createColumnInFilterWithParameters("SysAdminUnitTypeValue",
						sysAdminUnitTypes);
					var notExistsFilter = this.Terrasoft.createNotExistsFilter(
						"[SysUserInRole:SysRole:Id].Id");
					var subFilter = this.Terrasoft.createColumnFilterWithParameter(
						this.Terrasoft.ComparisonType.EQUAL,
						"SysUser",
						this.getUser().value);
					notExistsFilter.subFilters.addItem(subFilter);
					filters.addItem(notExistsFilter);
					filters.addItem(typeFilter);
					return filters;
				}
			},
			rules: {
			}
		};
	});
