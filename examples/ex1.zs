id2(x1 : Int) =>

    id(x2) => (x2,x2)

    let id3 = (x3) => id(

        x3)

    let y = id(x1)

    return id3(((x4) => x4)(y))

id2(42)
