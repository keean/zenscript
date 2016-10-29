id2(x) =>

    id(x) => (x,x)

    let id3 = (x) => id(

        x)

    let y = id(x)

    return id3(((x) => x)(y))

id2(42)
