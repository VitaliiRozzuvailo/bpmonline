define('ProcessDesigner', ['ext-base', 'terrasoft', 'sandbox', 'ProcessDesignerResources',
    'ProcessDesignerUtilities'],
    function(Ext, Terrasoft, sandbox, resources, pdUtilities) {
        var pdDiagramName = 'pdDiagram';
        var pdLeftPanelName = 'pdElementsMenuPanel';
        var viewModel = null;

        function onLoadProcessSchema(request, success, response) {
            if (success) {
                this.values = Ext.decode(Ext.decode(response.responseText));
                sandbox.publish('LoadProcessSchema', {flowElements: this.values.flowElements});
            }
        }

        function onAddedFlowElement(args) {
            this.methods.onAddedFlowElement(args);
        }

        function createViewModel() {
            return pdUtilities.createViewModel();
        }

        function createView() {
            return pdUtilities.createView(pdDiagramName);
        }

        function init() {
            sandbox.publish('SideBarVisibilityChanged', {
                panel: 'leftpanel',
                moduleName: null
            });
        }

        function render(renderTo) {
            viewModel = createViewModel();
            var view = createView();
            view.bind(viewModel);
            view.render(renderTo);
			pdUtilities.loadCommandLineModule(sandbox);
            sandbox.subscribe('FlowElementAdded', function(args) {
                viewModel.methods.onAddedFlowElement.call(viewModel, args);
            });
            sandbox.subscribe('LoadProcessSchemaEdit', function() {
                var historyState = sandbox.publish('GetHistoryState');
                var hash = historyState.hash;
                if (hash && hash.entityName) {
                    viewModel.methods.loadProcessSchema.call(viewModel, hash.entityName, onLoadProcessSchema);
                }
            });
            sandbox.subscribe('LoadProcessDesigner', function() {
                return {
                    pdDiagramName: pdDiagramName,
                    pdLeftPanelName: pdLeftPanelName
                };
            });
            sandbox.loadModule('ProcessSchemaEdit', {id: 'ProcessSchemaEdit'});
        }

        return {
            init: init,
            renderTo: Ext.get('centerPanel'),
            render: render
        };
    });