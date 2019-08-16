/**
 * 定义全局变量
 * cx：原点
 * cy：原点
 * r：中心圆半径
 * r2：直线长度
 * qzr2：权重时的长度
 * r3：外圈圆半径
 * data：数据
 */
let cx, cy, r, r2, qzr2, r3, date, width, height, svg, defs, mainSvg, x, y;

/**
 * 初始化对象
 * @param {*} initJson
 */
function InitGx(initJson) {
    this.width = initJson["width"];
    this.height = initJson["height"];
    this.r = initJson["r"];
    this.r2 = initJson["r2"];
    this.qzr2 = initJson["qzr2"];
    this.r3 = initJson["r3"];
    this.date = initJson["date"];
}

InitGx.prototype.init = function () {
    //初始化变量
    width = this.width;
    height = this.height;
    cx = width / 2;
    cy = height / 2;
    r = this.r;
    r2 = this.r2;
    qzr2 = this.qzr2;
    r3 = this.r3;
    date = this.date;
    svg = d3.select("body")
        .append("svg")
        .attr("id", "mainSvg")
        .attr("width", width)
        .attr("height", height);
    defs = svg.append("defs");
    mainSvg = document.getElementById("mainSvg");

    //开始方法
    new CreateGxPerson(date.gx).drawGxPerson();
    new CreatePerson(date.main).drawPerson();

    //添加动作
    d3.selectAll(".movement").on("mouseover", function () {
        mainSvg.pauseAnimations();
        svg.append("rect")
            .attr("id", "detail")
            .attr("x", d3.event.pageX - 150)
            .attr("y", d3.event.pageY + 30)
            .attr("rx", 10)
            .attr("ry", 10)
            .attr("width", "300")
            .attr("height", "80")
            .style("fill", "#fff")
            .style("stroke", "rgb(26,172,164)")
            .style("stroke-width", 1)
            .style("opacity", 0.9);
    })
    d3.selectAll(".movement").on("mousemove", function () {
        svg.select("#detail")
            .attr("x", d3.event.pageX - 150)
            .attr("y", d3.event.pageY + 30);
    })
    d3.selectAll(".movement").on("mouseout", function () {
        mainSvg.unpauseAnimations();
        svg.select("#detail").remove();
    })

    d3.selectAll(".movement").on("click", function () {
        alert(1);
    })
};

/**
 * 中心圆对象
 * @param {*} main
 */
function CreatePerson(main) {
    this.id = main["id"] || null;
    this.name = main["name"] || null;
    this.sfzh = main["sfzh"] || null;
    this.src = main["src"] || null;
}

CreatePerson.prototype.drawPerson = function () {
    drawPattern({
        main: defs,
        idName: this.id,
        src: this.src,
    });
    drawCircle({
        main: svg,
        cx: cx,
        cy: cy,
        r: r,
        fill: "#1d1d1d"
    });
    drawCircle({
        main: svg,
        cx: cx,
        cy: cy,
        r: r,
        fill: "url(#" + this.id + ")"
    });
};

/**
 * 关系圆对象
 * @param {*} main
 */
function CreateGxPerson(main) {
    this.gx = main || null;
    this.x2 = null;
    this.y2 = null;
}

CreateGxPerson.prototype.countXY = function (deg, ifQz) {
    let r;
    if (ifQz) {
        r = qzr2;
    } else {
        r = r2;
    }
    if (deg >= 0 && deg <= 90) {
        x = r * sin(deg);
        y = r * cos(deg);
        this.x2 = x + cx;
        this.y2 = -y + cy;
    } else if (deg > 90 && deg <= 180) {
        x = r * cos(deg - 90);
        y = r * sin(deg - 90);
        this.x2 = x + cx;
        this.y2 = y + cy;
    } else if (deg > 180 && deg <= 270) {
        x = r * sin(deg - 180);
        y = r * cos(deg - 180);
        this.x2 = -x + cx;
        this.y2 = y + cy;
    } else if (deg > 270 && deg < 360) {
        x = r * cos(deg - 270);
        y = r * sin(deg - 270);
        this.x2 = -x + cx;
        this.y2 = -y + cy;
    }
};

CreateGxPerson.prototype.drawGxPerson = function () {
    let l = this.gx.length;
    let d = 360 / l;
    for (let i = 0; i < l; i++) {
        let deg = d * i + 15;
        this.countXY(deg, this.gx[i].qz);
        let g1 = svg.append("g").attr("class", "rotate");
        drawPattern({
            main: defs,
            idName: this.gx[i].id,
            src: this.gx[i].src
        });
        drawLine({
            main: g1,
            x1: cx,
            y1: cy,
            x2: this.x2,
            y2: this.y2,
            deg: deg,
            gxmc: this.gx[i].gxmc
        });

        let g2 = g1.insert("g");
        //使用参照图片绘制圆形
        drawCircle({
            main: g2,
            className: "movement",
            r: r3,
            cx: this.x2,
            cy: this.y2,
            fill: "#1d1d1d"
        });
        drawCircle({
            main: g2,
            className: "movement",
            r: r3,
            cx: this.x2,
            cy: this.y2,
            fill: "url(#" + this.gx[i].id + ")"
        });
        //添加动画
        drawAnimateCw({
            main: g1,
            x: cx,
            y: cy
        });
        drawAnimateCcw({
            main: g2,
            x: this.x2,
            y: this.y2
        });
    }
};

function drawCircle(pz) {
    pz["main"].append("circle")
        .attr("class", pz["className"])
        .attr("r", pz["r"])
        .attr("cx", pz["cx"])
        .attr("cy", pz["cy"])
        .style("fill", pz["fill"]);
}

function drawPattern(pz) {
    pz["main"].append("pattern")
        .attr("id", pz["idName"])
        .attr("width", "1")
        .attr("height", "1")
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("xlink:href", pz["src"])
        .attr("preserveAspectRatio", "xMidYMid slice")
        .attr("x", "0")
        .attr("y", "0")
        .attr("width", "1")
        .attr("height", "1");
}

function drawAnimateCw(pz) {
    pz["main"].append("animateTransform")
        .attr("attributeName", "transform")
        .attr("type", "rotate")
        .attr("from", "0," + pz["x"] + "," + pz["y"])
        .attr("to", "360," + pz["x"] + "," + pz["y"])
        .attr("dur", "120s")
        .attr("repeatCount", "indefinite");
}

function drawAnimateCcw(pz) {
    pz["main"].append("animateTransform")
        .attr("attributeName", "transform")
        .attr("type", "rotate")
        .attr("from", "360," + pz["x"] + "," + pz["y"])
        .attr("to", "0," + pz["x"] + "," + pz["y"])
        .attr("dur", "120s")
        .attr("repeatCount", "indefinite");
}

function drawLine(pz) {
    let newR = r2 / 2 - r3 / 2 + r / 2;
    let deg = pz["deg"];
    if (deg >= 0 && deg <= 90) {
        x = newR * sin(deg);
        y = -newR * cos(deg);
        deg += 180;
    } else if (deg > 90 && deg <= 180) {
        deg += 180;
        x = -newR * cos(deg - 90);
        y = -newR * sin(deg - 90);
    } else if (deg > 180 && deg <= 270) {
        x = -newR * sin(deg - 180);
        y = newR * cos(deg - 180);
    } else if (deg > 270 && deg < 360) {
        x = -newR * cos(deg - 270);
        y = -newR * sin(deg - 270);
    }
    pz["main"].append("line")
        .attr("class", "movement")
        .attr("x1", pz["x1"])
        .attr("y1", pz["y1"])
        .attr("x2", pz["x2"])
        .attr("y2", pz["y2"])
        .style("stroke", "rgb(26,172,164)")
        .style("stroke-width", 3);
    pz["main"].append("text")
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (cx + x) + "," + (cy + y) + ") rotate(" + (deg + 90) + ") translate(0 -8) ")
        .attr("fill", "#E9BA49")
        .text(pz["gxmc"])
}

function sin(deg) {
    return Math.sin(deg * Math.PI / 180);
};

function cos(deg) {
    return Math.cos(deg * Math.PI / 180);
};