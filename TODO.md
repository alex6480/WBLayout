1. Make it possible to add images directly from the selected element menu. Currently it is only possible to add an image if no images exist. It should be possible if an image is selcted as wel by selectning an "add new image" option.
2. Add a save dialog. The dialog should ask:
    1. Whether the WB is intended to be used in illustrator. This will make it left align text as the positioning is not preserved. Users will have to manually center align afterwards
    2. Whether images should be embedded in the SVG or linked
3. Automatically prompt the user to import missing images when opening a save file
4. Add functionality to reorder elements
5. Use SVG filters to see if they are supported better in other applications. Currently the filters don't work in illustrator or microsoft office
6. Add a menu for modifying well labes
    1. It should be possible to add multiple rows of well labels
    2. In each row it should be possible to create groups of wells and have a single label covering all of them
       Something like:
       Treatment  Control
       --------- ---------
        A    B    C    D
       ---- ---- ---- ----
    3. This necessitates adding a new property for well spacing