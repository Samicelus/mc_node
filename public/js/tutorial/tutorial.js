var viewer = PhotoSphereViewer({
    container: 'c1',
    panorama: '../images/tutorial.jpg'
});

viewer.on('ready', function() {
    viewer.rotate({
        x: 1024,
        y: 768
    });
});