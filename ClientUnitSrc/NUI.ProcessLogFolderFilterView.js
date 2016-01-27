define('ProcessLogFolderFilterView', ['ext-base', 'terrasoft',
	'ProcessLogFolderFilterViewResources', 'FolderLookupPageView'],
		function(Ext, Terrasoft, resources, FolderLookupPageView ) {

			function generate() {
				return FolderLookupPageView.generate();
			}

			function getFolderView() {
				var view = FolderLookupPageView.getFolderView();
				var lookupeditCaptionConfig = {
					className: 'Terrasoft.Label',
					labelClass: 't-label controlCaption',
					caption: resources.localizableStrings.SysProcessEntity,
					markerValue: 'SysProcessEntity'
				};
                var lookupEditConfig = {
                    id: 'entitySchemaLookupEdit',
                    className: 'Terrasoft.LookupEdit',
					markerValue: 'SysProcessEntity',
                    value: {
                        bindTo: 'lookupSelectedValue'
                    },
                    list: {
                        bindTo: 'entitySchemaLookupEditList'
                    },
                    prepareList: {
                        bindTo: 'getEntitySchemaNames'
                    },
                    loadVocabulary: {
                        bindTo: 'loadEntitySchemaNames'
                    },
                    change: {
                        bindTo:'changedEntitySchemaName'
                    }
                };
				view.items.splice(1, 0, lookupeditCaptionConfig);
				view.items.splice(2, 0, lookupEditConfig);
				return view;
			}

			return {
				generate: generate,
				getFolderView: getFolderView
			};
		});