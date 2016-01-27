define("SectionDesignerViewModule", ["ext-base", "sandbox", "terrasoft", "BaseViewModule", "ConfigurationViewModule"],
	function(Ext, sandbox, Terrasoft) {

		/**
		 * @class Terrasoft.configuration.ViewModule
		 * Класс визуального модуля представления для мастера разделов.
		 */
		Ext.define("Terrasoft.configuration.SectionDesignerViewModule", {
			extend: "Terrasoft.ConfigurationViewModule",
			alternateClassName: "Terrasoft.SectionDesignerViewModule",

			diff: [{
				"operation": "remove",
				"name": "leftPanel"
			}, {
				"operation": "remove",
				"name": "communicationPanel"
			}, {
				"operation": "remove",
				"name": "rightPanel"
			}, {
				"operation": "remove",
				"name": "mainHeader"
			}],

			/**
			 * @inheritDoc Terrasoft.configuration.BaseViewModule#init
			 * @overridden
			 */
			render: function(renderTo) {
				renderTo.addCls("section-designer-shown");
				this.callParent(arguments);
			},

			/**
			 * @inheritDoc Terrasoft.configuration.ConfigurationViewModule#onSideBarModuleDefInfo
			 * @overridden
			 */
			onSideBarModuleDefInfo: Terrasoft.emptyFn,

			/**
			 * @inheritDoc Terrasoft.configuration.BaseViewModule#loadModuleFromHistoryState
			 * @overridden
			 */
			loadModuleFromHistoryState: function(token) {
				var currentState = this.sandbox.publish("GetHistoryState");
				var moduleName = this.getModuleName(token);
				if (!moduleName) {
					return;
				}
				this.onStateChanged();
				this.sandbox.loadModule(moduleName, { renderTo: "centerPanel" });
			}

		});

		return Terrasoft.SectionDesignerViewModule;
	});