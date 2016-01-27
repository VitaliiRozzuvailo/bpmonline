define('GeneratedWebFormSection', ['ext-base', 'terrasoft', 'sandbox', 'GeneratedWebForm',
		'GeneratedWebFormSectionStructure', 'GeneratedWebFormSectionResources', 'ConfigurationEnums',
		'GeneratedWebFormUtilities'],
	function(Ext, Terrasoft, sandbox, GeneratedWebForm, structure, resources, ConfigurationEnums,
			GeneratedWebFormUtilities) {
		structure.userCode = function() {
			this.entitySchema = GeneratedWebForm;
			this.name = 'GeneratedWebFormSectionViewModel';
			this.columnsConfig = [
				[
					{
						cols: 24,
						key: [
							{
								name: {
									bindTo: 'Name'
								},
								type: 'title'
							}
						]
					}
				]
			];

			this.loadedColumns = [{
				columnPath: 'Name'
			}];

			this.getEditPages = function(viewName) {
				return undefined;
			};

			this.methods.getViews = function(baseGetViews) {
				var views = baseGetViews.call(this);
				for (var i = 0; i < views.length; i++) {
					if (views[i].name === 'mainView') {
						views[i].caption = resources.localizableStrings.GeneratedWebFormsHeader;
						break;
					}
				}
				return views.splice(0, 1);
			};

			this.methods.initViewModel = function() {
				var scope = this;
				scope.set("DesignFormFieldsToSaveCode", false);
				sandbox.subscribe("CardModuleResponse", function(result) {
					if (scope.get("DesignFormFieldsToSaveCode") && result) {
						scope.set("DesignFormFieldsToSaveCode", false);
						GeneratedWebFormUtilities.saveFormCodeToFile(scope, scope.get("activeRow"));
					}
				}, ["ViewModule_SectionModule_GeneratedWebForm"]);
				GeneratedWebFormUtilities.initCanManageWebForms(this);
				this.set('addToStaticFolderVisible', false);
			};

			this.methods.saveFormCodeToFile = function() {
				var recordId = this.get('activeRow');
				if (recordId) {
					this.set("DesignFormFieldsToSaveCode", true);
					GeneratedWebFormUtilities.saveFormCodeToFile(this, recordId);
				}
			};

			var actions = this.actions;
			if (!actions) {
				actions = [];
			}
			actions.push({
				caption: resources.localizableStrings.SaveFormCodeToFileCaption,
				methodName: "saveFormCodeToFile",
				visible: {
					bindTo: 'canManageWebForms'
				},
				enabled: {
					bindTo: 'activeRow',
					bindConfig: {
						converter: function(value) {
							return !Ext.isEmpty(value);
						}
					}
				}
			});
			this.actions = actions;
		};

		return structure;
	});