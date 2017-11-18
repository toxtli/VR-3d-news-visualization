function getGraphDataSets() {

    const loadMiserables = function(Graph) {
        Graph
            .cooldownTicks(200)
            .nameField('id')
            .autoColorBy('group')
            .forceEngine('ngraph')
            .jsonUrl('.miserables.json');
    };
    loadMiserables.description = "<em>Les Miserables</em> data (<a href='https://bl.ocks.org/mbostock/4062045'>4062045</a>)";

    //

    const loadBlocks = function(Graph) {
        qwest.get('.blocks.json').then((_, data) => {
            data.nodes.forEach(node => { node.name = `${node.user?node.user+': ':''}${node.description || node.id}` });

            Graph
                .cooldownTicks(300)
                .cooldownTime(20000)
                .autoColorBy('user')
                .forceEngine('ngraph')
                .graphData(data);
        });
    };
    loadBlocks.description = "<em>Blocks</em> data (<a href='https://bl.ocks.org/mbostock/afecf1ce04644ad9036ca146d2084895'>afecf1ce04644ad9036ca146d2084895</a>)";

    //

    const loadD3Dependencies = function(Graph) {
        qwest.get('.d3.csv').then((_, csvData) => {
            const { data: [, ...data] } = Papa.parse(csvData); // Parse csv
            data.pop(); // Remove last empty row

            const nodes = [], links = [];
            data.forEach(([size, path]) => {
                const levels = path.split('/'),
                    module = levels.length > 1 ? levels[1] : null,
                    leaf = levels.pop(),
                    parent = levels.join('/');

                nodes.push({
                    path,
                    leaf,
                    module,
                    size: +size || 1
                });

                if (parent) {
                    links.push({ source: parent, target: path});
                }
            });

            Graph
                .cooldownTicks(300)
                .nodeRelSize(0.5)
                .idField('path')
                .valField('size')
                .nameField('path')
                .autoColorBy('module')
                .forceEngine('ngraph')
                .graphData({ nodes: nodes, links: links });
        });
    };
    loadD3Dependencies.description = "<em>D3 dependencies</em> data (<a href='https://bl.ocks.org/mbostock/9a8124ccde3a4e9625bc413b48f14b30'>9a8124ccde3a4e9625bc413b48f14b30</a>)";

    const tunnel = function(Graph) {

        const perimeter = 12, length = 30;

        const getId = (col, row) => `${col},${row}`;

        let nodes = [], links = [];
        for (let colIdx=0; colIdx<perimeter; colIdx++) {
            for (let rowIdx=0; rowIdx<length; rowIdx++) {
                const id = getId(colIdx, rowIdx);
                nodes.push({id});

                // Link vertically
                if (rowIdx>0) {
                    links.push({ source: getId(colIdx, rowIdx-1), target: id });
                }

                // Link horizontally
                links.push({ source: getId((colIdx || perimeter) - 1, rowIdx), target: id });
            }
        }

        Graph
            .cooldownTicks(300)
            .forceEngine('ngraph')
            .graphData({ nodes: nodes, links: links });
    };
    tunnel.description = "fabric data for a cylindrical tunnel shape";

    //

    return [loadMiserables, loadBlocks, loadD3Dependencies, tunnel];
}