let id2 = (x) =>

    let id = (x) => (x,x)

    let id3 = (x) => id(

        x)

    let y = id(x)

    return id3(y)

id2(42)
