var viewer = PhotoSphereViewer({
    container: 'c1',
    panorama: '../images/tutorial.jpg',
    navbar: [
        'autorotate',
        'zoom',
        'markers',
        {
            id: 'my-button',
            title: 'Hello world',
            className: 'custom-button',
            content: 'Custom',
            onClick: function() {
                alert('Hello from custom button');
            }
        },
        'caption',
        'fullscreen'
    ]
});

viewer.on('ready', function() {
    viewer.rotate({
        x: 1500,
        y: 1000
    });
});