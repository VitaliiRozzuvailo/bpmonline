define("WizardUtilities", ["terrasoft", "WizardUtilitiesResources", "RightUtilities", "DesignTimeEnums"],
	function(Terrasoft, resources, RightUtilities) {

		var localizableStrings = resources.localizableStrings;

		var WizardUtilities = Ext.define("Terrasoft.configuration.mixins.WizardUtilities", {

			alternateClassName: "Terrasoft.WizardUtilities",

			/**
			 * Открывает мастер детали.
			 * @protected
			 * @virtual
			 */
			openDetailWizard: function() {
				var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "SysDetail",
					isDistinct: true
				});
				esq.addColumn("Id");
				var filterGroup = this.Terrasoft.createFilterGroup();
				filterGroup.logicalOperation = this.Terrasoft.LogicalOperatorType.AND;
				filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL,
					"[VwSysSchemaInWorkspace:UId:EntitySchemaUId].Name",
					this.entitySchemaName));
				filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.NOT_EQUAL,
					"[VwSysSchemaInWorkspace:UId:EntitySchemaUId].ExtendParent",
					1));
				filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL,
					"[VwSysSchemaInWorkspace:UId:DetailSchemaUId].Name",
					this.get("SchemaName")));
				filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.NOT_EQUAL,
					"[VwSysSchemaInWorkspace:UId:DetailSchemaUId].ExtendParent",
					1));
				filterGroup.addItem(this.Terrasoft.createColumnFilterWithParameter(
					this.Terrasoft.ComparisonType.EQUAL,
					"[VwSysSchemaInWorkspace:UId:EntitySchemaUId].SysWorkspace",
					Terrasoft.SysValue.CURRENT_WORKSPACE.value));
				esq.filters.add("SchemasFilters", filterGroup);
				esq.getEntityCollection(function(result) {
					if (result.success) {
						var detail = result.collection.getByIndex(0);
						var detailId = detail && detail.get("Id");
						if (detailId) {
							this.openDetailWindow(detailId);
						} else {
							Terrasoft.utils.showMessage({
								caption:  localizableStrings.DetailIsNotRegisteredMessage,
								buttons: ["ok"],
								defaultButton: 0
							});
						}
					}
				}, this);
			},

			/**
			 * Открывает окно мастера детали.
			 * @protected
			 * @virtual
			 * @param {String} id Идентификатор детали.
			 */
			openDetailWindow: function(id) {
				var detailWizardUrl = Terrasoft.workspaceBaseUrl +
					Terrasoft.DesignTimeEnums.WizardUrl.DETAIL_WIZARD_URL +
					id;
				window.open(detailWizardUrl);
			},

			/**
			 * Проверяет права на операцию CanManageSolution.
			 * @protected
			 * @virtual
			 * @param {Function} callback Функция обратного вызова.
			 * @param {Object} scope Контекст вызова callback-функции.
			 */
			canUseWizard: function(callback, scope) {
				RightUtilities.checkCanExecuteOperation({
					operation: "CanManageSolution"
				}, function(result) {
					callback.call(scope, result);
				}, this);
			}
		});
		return Ext.create(WizardUtilities);
	});