define("SetupTelephonyParametersPageModule", ["BaseSchemaModuleV2", "CtiConstants", "CtiBaseHelper"],
		function(BaseSchemaModuleV2, CtiConstants, CtiBaseHelper) {
	/**
	 * @class Terrasoft.configuration.SetupTelephonyParametersPageModule
	 * Класс страницы настроек параметров телефонии.
	 */
	Ext.define("Terrasoft.configuration.SetupTelephonyParametersPageModule", {
		alternateClassName: "Terrasoft.SetupTelephonyParametersPageModule",
		extend: "Terrasoft.BaseSchemaModule",

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#init
		 * @overridden
		 */
		init: function(callback, scope) {
			callback = callback || function() {};
			if (this.viewModel) {
				this.viewModel.set("Restored", true);
				callback.call(scope);
				return;
			}
			this.schemaBuilder = this.Ext.create("Terrasoft.SchemaBuilder");
			this.initHistoryState();
			Terrasoft.SysSettings.querySysSettingsItem("SysMsgLib", function(sysSettingsValue) {
				var currentSysMsgLibId = sysSettingsValue.value.toLowerCase();
				if (Terrasoft.SysValue.CTI && Terrasoft.SysValue.CTI.sysMsgLibId !== currentSysMsgLibId) {
					Terrasoft.SysValue.CTI.isInitialized = false;
				}
				CtiBaseHelper.queryCtiSettings(function(ctiSettings) {
					this.schemaName = ctiSettings.setupPageSchemaName;
					this.generateSchemaStructure(function(viewModelClass, viewConfig) {
						if (this.destroyed) {
							return;
						}
						this.viewModelClass = viewModelClass;
						this.viewConfig = viewConfig;
						var viewModel = this.viewModel = this.createViewModel(viewModelClass);
						viewModel.set("sysMsgLibId", ctiSettings.sysMsgLibId);
						viewModel.init(function() {
							if (!this.destroyed) {
								callback.call(scope);
							}
						}, this);
					}, this);
				}.bind(this));
			}, this);
		},

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#render
		 * @overridden
		 */
		render: function() {
			this.callParent(arguments);
			var headerCaption = this.viewModel.get("Resources.Strings.HeaderCaption");
			this.sandbox.publish("ChangeHeaderCaption", {
				caption: headerCaption,
				dataViews: new Terrasoft.Collection()
			});
			this.sandbox.subscribe("NeedHeaderCaption", function() {
				this.sandbox.publish("InitDataViews", {
					caption: headerCaption
				});
			}, this);
		},

		/**
		 * @inheritdoc Terrasoft.BaseSchemaModule#initHistoryState
		 * @overridden
		 */
		initHistoryState: function() {
			var sandbox = this.sandbox;
			var state = sandbox.publish("GetHistoryState");
			var currentHash = state.hash;
			var currentState = state.state || {};
			if (currentState.moduleId === sandbox.id) {
				return;
			}
			var newState = Terrasoft.deepClone(currentState);
			newState.moduleId = sandbox.id;
			sandbox.publish("ReplaceHistoryState", {
				stateObj: newState,
				hash: currentHash.historyState,
				silent: true
			});
		}

	});
	return Terrasoft.SetupTelephonyParametersPageModule;
});