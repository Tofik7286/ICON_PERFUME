(function() {
    const e = document.createElement("link").relList;
    if (e && e.supports && e.supports("modulepreload")) return;
    for (const n of document.querySelectorAll('link[rel="modulepreload"]')) s(n);
    new MutationObserver(n => {
        for (const r of n)
            if (r.type === "childList")
                for (const l of r.addedNodes) l.tagName === "LINK" && l.rel === "modulepreload" && s(l)
    }).observe(document, {
        childList: !0,
        subtree: !0
    });

    function i(n) {
        const r = {};
        return n.integrity && (r.integrity = n.integrity), n.referrerPolicy && (r.referrerPolicy = n.referrerPolicy), n.crossOrigin === "use-credentials" ? r.credentials = "include" : n.crossOrigin === "anonymous" ? r.credentials = "omit" : r.credentials = "same-origin", r
    }

    function s(n) {
        if (n.ep) return;
        n.ep = !0;
        const r = i(n);
        fetch(n.href, r)
    }
})();

function oe(t) {
    return t !== null && typeof t == "object" && "constructor" in t && t.constructor === Object
}

function le(t, e) {
    t === void 0 && (t = {}), e === void 0 && (e = {}), Object.keys(e).forEach(i => {
        typeof t[i] > "u" ? t[i] = e[i] : oe(e[i]) && oe(t[i]) && Object.keys(e[i]).length > 0 && le(t[i], e[i])
    })
}
const he = {
    body: {},
    addEventListener() {},
    removeEventListener() {},
    activeElement: {
        blur() {},
        nodeName: ""
    },
    querySelector() {
        return null
    },
    querySelectorAll() {
        return []
    },
    getElementById() {
        return null
    },
    createEvent() {
        return {
            initEvent() {}
        }
    },
    createElement() {
        return {
            children: [],
            childNodes: [],
            style: {},
            setAttribute() {},
            getElementsByTagName() {
                return []
            }
        }
    },
    createElementNS() {
        return {}
    },
    importNode() {
        return null
    },
    location: {
        hash: "",
        host: "",
        hostname: "",
        href: "",
        origin: "",
        pathname: "",
        protocol: "",
        search: ""
    }
};

function $() {
    const t = typeof document < "u" ? document : {};
    return le(t, he), t
}
const Te = {
    document: he,
    navigator: {
        userAgent: ""
    },
    location: {
        hash: "",
        host: "",
        hostname: "",
        href: "",
        origin: "",
        pathname: "",
        protocol: "",
        search: ""
    },
    history: {
        replaceState() {},
        pushState() {},
        go() {},
        back() {}
    },
    CustomEvent: function() {
        return this
    },
    addEventListener() {},
    removeEventListener() {},
    getComputedStyle() {
        return {
            getPropertyValue() {
                return ""
            }
        }
    },
    Image() {},
    Date() {},
    screen: {},
    setTimeout() {},
    clearTimeout() {},
    matchMedia() {
        return {}
    },
    requestAnimationFrame(t) {
        return typeof setTimeout > "u" ? (t(), null) : setTimeout(t, 0)
    },
    cancelAnimationFrame(t) {
        typeof setTimeout > "u" || clearTimeout(t)
    }
};

function D() {
    const t = typeof window < "u" ? window : {};
    return le(t, Te), t
}

function xe(t) {
    return t === void 0 && (t = ""), t.trim().split(" ").filter(e => !!e.trim())
}

function ye(t) {
    const e = t;
    Object.keys(e).forEach(i => {
        try {
            e[i] = null
        } catch {}
        try {
            delete e[i]
        } catch {}
    })
}

function re(t, e) {
    return e === void 0 && (e = 0), setTimeout(t, e)
}

function K() {
    return Date.now()
}

function be(t) {
    const e = D();
    let i;
    return e.getComputedStyle && (i = e.getComputedStyle(t, null)), !i && t.currentStyle && (i = t.currentStyle), i || (i = t.style), i
}

function Ee(t, e) {
    e === void 0 && (e = "x");
    const i = D();
    let s, n, r;
    const l = be(t);
    return i.WebKitCSSMatrix ? (n = l.transform || l.webkitTransform, n.split(",").length > 6 && (n = n.split(", ").map(o => o.replace(",", ".")).join(", ")), r = new i.WebKitCSSMatrix(n === "none" ? "" : n)) : (r = l.MozTransform || l.OTransform || l.MsTransform || l.msTransform || l.transform || l.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,"), s = r.toString().split(",")), e === "x" && (i.WebKitCSSMatrix ? n = r.m41 : s.length === 16 ? n = parseFloat(s[12]) : n = parseFloat(s[4])), e === "y" && (i.WebKitCSSMatrix ? n = r.m42 : s.length === 16 ? n = parseFloat(s[13]) : n = parseFloat(s[5])), n || 0
}

function q(t) {
    return typeof t == "object" && t !== null && t.constructor && Object.prototype.toString.call(t).slice(8, -1) === "Object"
}

function Me(t) {
    return typeof window < "u" && typeof window.HTMLElement < "u" ? t instanceof HTMLElement : t && (t.nodeType === 1 || t.nodeType === 11)
}

function k() {
    const t = Object(arguments.length <= 0 ? void 0 : arguments[0]),
        e = ["__proto__", "constructor", "prototype"];
    for (let i = 1; i < arguments.length; i += 1) {
        const s = i < 0 || arguments.length <= i ? void 0 : arguments[i];
        if (s != null && !Me(s)) {
            const n = Object.keys(Object(s)).filter(r => e.indexOf(r) < 0);
            for (let r = 0, l = n.length; r < l; r += 1) {
                const o = n[r],
                    a = Object.getOwnPropertyDescriptor(s, o);
                a !== void 0 && a.enumerable && (q(t[o]) && q(s[o]) ? s[o].__swiper__ ? t[o] = s[o] : k(t[o], s[o]) : !q(t[o]) && q(s[o]) ? (t[o] = {}, s[o].__swiper__ ? t[o] = s[o] : k(t[o], s[o])) : t[o] = s[o])
            }
        }
    }
    return t
}

function Y(t, e, i) {
    t.style.setProperty(e, i)
}

function ge(t) {
    let {
        swiper: e,
        targetPosition: i,
        side: s
    } = t;
    const n = D(),
        r = -e.translate;
    let l = null,
        o;
    const a = e.params.speed;
    e.wrapperEl.style.scrollSnapType = "none", n.cancelAnimationFrame(e.cssModeFrameID);
    const d = i > r ? "next" : "prev",
        c = (u, p) => d === "next" && u >= p || d === "prev" && u <= p,
        f = () => {
            o = new Date().getTime(), l === null && (l = o);
            const u = Math.max(Math.min((o - l) / a, 1), 0),
                p = .5 - Math.cos(u * Math.PI) / 2;
            let h = r + p * (i - r);
            if (c(h, i) && (h = i), e.wrapperEl.scrollTo({
                    [s]: h
                }), c(h, i)) {
                e.wrapperEl.style.overflow = "hidden", e.wrapperEl.style.scrollSnapType = "", setTimeout(() => {
                    e.wrapperEl.style.overflow = "", e.wrapperEl.scrollTo({
                        [s]: h
                    })
                }), n.cancelAnimationFrame(e.cssModeFrameID);
                return
            }
            e.cssModeFrameID = n.requestAnimationFrame(f)
        };
    f()
}

function _(t, e) {
    return e === void 0 && (e = ""), [...t.children].filter(i => i.matches(e))
}

function U(t) {
    try {
        console.warn(t);
        return
    } catch {}
}

function ne(t, e) {
    e === void 0 && (e = []);
    const i = document.createElement(t);
    return i.classList.add(...Array.isArray(e) ? e : xe(e)), i
}

function Pe(t, e) {
    const i = [];
    for (; t.previousElementSibling;) {
        const s = t.previousElementSibling;
        e ? s.matches(e) && i.push(s) : i.push(s), t = s
    }
    return i
}

function Ie(t, e) {
    const i = [];
    for (; t.nextElementSibling;) {
        const s = t.nextElementSibling;
        e ? s.matches(e) && i.push(s) : i.push(s), t = s
    }
    return i
}

function N(t, e) {
    return D().getComputedStyle(t, null).getPropertyValue(e)
}

function de(t) {
    let e = t,
        i;
    if (e) {
        for (i = 0;
            (e = e.previousSibling) !== null;) e.nodeType === 1 && (i += 1);
        return i
    }
}

function Ce(t, e) {
    const i = [];
    let s = t.parentElement;
    for (; s;) e ? s.matches(e) && i.push(s) : i.push(s), s = s.parentElement;
    return i
}

function ce(t, e, i) {
    const s = D();
    return i ? t[e === "width" ? "offsetWidth" : "offsetHeight"] + parseFloat(s.getComputedStyle(t, null).getPropertyValue(e === "width" ? "margin-right" : "margin-top")) + parseFloat(s.getComputedStyle(t, null).getPropertyValue(e === "width" ? "margin-left" : "margin-bottom")) : t.offsetWidth
}
let Q;

function Le() {
    const t = D(),
        e = $();
    return {
        smoothScroll: e.documentElement && e.documentElement.style && "scrollBehavior" in e.documentElement.style,
        touch: !!("ontouchstart" in t || t.DocumentTouch && e instanceof t.DocumentTouch)
    }
}

function ve() {
    return Q || (Q = Le()), Q
}
let Z;

function Oe(t) {
    let {
        userAgent: e
    } = t === void 0 ? {} : t;
    const i = ve(),
        s = D(),
        n = s.navigator.platform,
        r = e || s.navigator.userAgent,
        l = {
            ios: !1,
            android: !1
        },
        o = s.screen.width,
        a = s.screen.height,
        d = r.match(/(Android);?[\s\/]+([\d.]+)?/);
    let c = r.match(/(iPad).*OS\s([\d_]+)/);
    const f = r.match(/(iPod)(.*OS\s([\d_]+))?/),
        u = !c && r.match(/(iPhone\sOS|iOS)\s([\d_]+)/),
        p = n === "Win32";
    let h = n === "MacIntel";
    const g = ["1024x1366", "1366x1024", "834x1194", "1194x834", "834x1112", "1112x834", "768x1024", "1024x768", "820x1180", "1180x820", "810x1080", "1080x810"];
    return !c && h && i.touch && g.indexOf(`${o}x${a}`) >= 0 && (c = r.match(/(Version)\/([\d.]+)/), c || (c = [0, 1, "13_0_0"]), h = !1), d && !p && (l.os = "android", l.android = !0), (c || u || f) && (l.os = "ios", l.ios = !0), l
}

function ze(t) {
    return t === void 0 && (t = {}), Z || (Z = Oe(t)), Z
}
let ee;

function Ae() {
    const t = D();
    let e = !1;

    function i() {
        const s = t.navigator.userAgent.toLowerCase();
        return s.indexOf("safari") >= 0 && s.indexOf("chrome") < 0 && s.indexOf("android") < 0
    }
    if (i()) {
        const s = String(t.navigator.userAgent);
        if (s.includes("Version/")) {
            const [n, r] = s.split("Version/")[1].split(" ")[0].split(".").map(l => Number(l));
            e = n < 16 || n === 16 && r < 2
        }
    }
    return {
        isSafari: e || i(),
        needPerspectiveFix: e,
        isWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(t.navigator.userAgent)
    }
}

function Ge() {
    return ee || (ee = Ae()), ee
}

function Ve(t) {
    let {
        swiper: e,
        on: i,
        emit: s
    } = t;
    const n = D();
    let r = null,
        l = null;
    const o = () => {
            !e || e.destroyed || !e.initialized || (s("beforeResize"), s("resize"))
        },
        a = () => {
            !e || e.destroyed || !e.initialized || (r = new ResizeObserver(f => {
                l = n.requestAnimationFrame(() => {
                    const {
                        width: u,
                        height: p
                    } = e;
                    let h = u,
                        g = p;
                    f.forEach(y => {
                        let {
                            contentBoxSize: v,
                            contentRect: M,
                            target: w
                        } = y;
                        w && w !== e.el || (h = M ? M.width : (v[0] || v).inlineSize, g = M ? M.height : (v[0] || v).blockSize)
                    }), (h !== u || g !== p) && o()
                })
            }), r.observe(e.el))
        },
        d = () => {
            l && n.cancelAnimationFrame(l), r && r.unobserve && e.el && (r.unobserve(e.el), r = null)
        },
        c = () => {
            !e || e.destroyed || !e.initialized || s("orientationchange")
        };
    i("init", () => {
        if (e.params.resizeObserver && typeof n.ResizeObserver < "u") {
            a();
            return
        }
        n.addEventListener("resize", o), n.addEventListener("orientationchange", c)
    }), i("destroy", () => {
        d(), n.removeEventListener("resize", o), n.removeEventListener("orientationchange", c)
    })
}

function ke(t) {
    let {
        swiper: e,
        extendParams: i,
        on: s,
        emit: n
    } = t;
    const r = [],
        l = D(),
        o = function(c, f) {
            f === void 0 && (f = {});
            const u = l.MutationObserver || l.WebkitMutationObserver,
                p = new u(h => {
                    if (e.__preventObserver__) return;
                    if (h.length === 1) {
                        n("observerUpdate", h[0]);
                        return
                    }
                    const g = function() {
                        n("observerUpdate", h[0])
                    };
                    l.requestAnimationFrame ? l.requestAnimationFrame(g) : l.setTimeout(g, 0)
                });
            p.observe(c, {
                attributes: typeof f.attributes > "u" ? !0 : f.attributes,
                childList: typeof f.childList > "u" ? !0 : f.childList,
                characterData: typeof f.characterData > "u" ? !0 : f.characterData
            }), r.push(p)
        },
        a = () => {
            if (e.params.observer) {
                if (e.params.observeParents) {
                    const c = Ce(e.hostEl);
                    for (let f = 0; f < c.length; f += 1) o(c[f])
                }
                o(e.hostEl, {
                    childList: e.params.observeSlideChildren
                }), o(e.wrapperEl, {
                    attributes: !1
                })
            }
        },
        d = () => {
            r.forEach(c => {
                c.disconnect()
            }), r.splice(0, r.length)
        };
    i({
        observer: !1,
        observeParents: !1,
        observeSlideChildren: !1
    }), s("init", a), s("destroy", d)
}
var De = {
    on(t, e, i) {
        const s = this;
        if (!s.eventsListeners || s.destroyed || typeof e != "function") return s;
        const n = i ? "unshift" : "push";
        return t.split(" ").forEach(r => {
            s.eventsListeners[r] || (s.eventsListeners[r] = []), s.eventsListeners[r][n](e)
        }), s
    },
    once(t, e, i) {
        const s = this;
        if (!s.eventsListeners || s.destroyed || typeof e != "function") return s;

        function n() {
            s.off(t, n), n.__emitterProxy && delete n.__emitterProxy;
            for (var r = arguments.length, l = new Array(r), o = 0; o < r; o++) l[o] = arguments[o];
            e.apply(s, l)
        }
        return n.__emitterProxy = e, s.on(t, n, i)
    },
    onAny(t, e) {
        const i = this;
        if (!i.eventsListeners || i.destroyed || typeof t != "function") return i;
        const s = e ? "unshift" : "push";
        return i.eventsAnyListeners.indexOf(t) < 0 && i.eventsAnyListeners[s](t), i
    },
    offAny(t) {
        const e = this;
        if (!e.eventsListeners || e.destroyed || !e.eventsAnyListeners) return e;
        const i = e.eventsAnyListeners.indexOf(t);
        return i >= 0 && e.eventsAnyListeners.splice(i, 1), e
    },
    off(t, e) {
        const i = this;
        return !i.eventsListeners || i.destroyed || !i.eventsListeners || t.split(" ").forEach(s => {
            typeof e > "u" ? i.eventsListeners[s] = [] : i.eventsListeners[s] && i.eventsListeners[s].forEach((n, r) => {
                (n === e || n.__emitterProxy && n.__emitterProxy === e) && i.eventsListeners[s].splice(r, 1)
            })
        }), i
    },
    emit() {
        const t = this;
        if (!t.eventsListeners || t.destroyed || !t.eventsListeners) return t;
        let e, i, s;
        for (var n = arguments.length, r = new Array(n), l = 0; l < n; l++) r[l] = arguments[l];
        return typeof r[0] == "string" || Array.isArray(r[0]) ? (e = r[0], i = r.slice(1, r.length), s = t) : (e = r[0].events, i = r[0].data, s = r[0].context || t), i.unshift(s), (Array.isArray(e) ? e : e.split(" ")).forEach(a => {
            t.eventsAnyListeners && t.eventsAnyListeners.length && t.eventsAnyListeners.forEach(d => {
                d.apply(s, [a, ...i])
            }), t.eventsListeners && t.eventsListeners[a] && t.eventsListeners[a].forEach(d => {
                d.apply(s, i)
            })
        }), t
    }
};

function Fe() {
    const t = this;
    let e, i;
    const s = t.el;
    typeof t.params.width < "u" && t.params.width !== null ? e = t.params.width : e = s.clientWidth, typeof t.params.height < "u" && t.params.height !== null ? i = t.params.height : i = s.clientHeight, !(e === 0 && t.isHorizontal() || i === 0 && t.isVertical()) && (e = e - parseInt(N(s, "padding-left") || 0, 10) - parseInt(N(s, "padding-right") || 0, 10), i = i - parseInt(N(s, "padding-top") || 0, 10) - parseInt(N(s, "padding-bottom") || 0, 10), Number.isNaN(e) && (e = 0), Number.isNaN(i) && (i = 0), Object.assign(t, {
        width: e,
        height: i,
        size: t.isHorizontal() ? e : i
    }))
}

function _e() {
    const t = this;

    function e(m, S) {
        return parseFloat(m.getPropertyValue(t.getDirectionLabel(S)) || 0)
    }
    const i = t.params,
        {
            wrapperEl: s,
            slidesEl: n,
            size: r,
            rtlTranslate: l,
            wrongRTL: o
        } = t,
        a = t.virtual && i.virtual.enabled,
        d = a ? t.virtual.slides.length : t.slides.length,
        c = _(n, `.${t.params.slideClass}, swiper-slide`),
        f = a ? t.virtual.slides.length : c.length;
    let u = [];
    const p = [],
        h = [];
    let g = i.slidesOffsetBefore;
    typeof g == "function" && (g = i.slidesOffsetBefore.call(t));
    let y = i.slidesOffsetAfter;
    typeof y == "function" && (y = i.slidesOffsetAfter.call(t));
    const v = t.snapGrid.length,
        M = t.slidesGrid.length;
    let w = i.spaceBetween,
        T = -g,
        b = 0,
        L = 0;
    if (typeof r > "u") return;
    typeof w == "string" && w.indexOf("%") >= 0 ? w = parseFloat(w.replace("%", "")) / 100 * r : typeof w == "string" && (w = parseFloat(w)), t.virtualSize = -w, c.forEach(m => {
        l ? m.style.marginLeft = "" : m.style.marginRight = "", m.style.marginBottom = "", m.style.marginTop = ""
    }), i.centeredSlides && i.cssMode && (Y(s, "--swiper-centered-offset-before", ""), Y(s, "--swiper-centered-offset-after", ""));
    const P = i.grid && i.grid.rows > 1 && t.grid;
    P ? t.grid.initSlides(c) : t.grid && t.grid.unsetSlides();
    let O;
    const V = i.slidesPerView === "auto" && i.breakpoints && Object.keys(i.breakpoints).filter(m => typeof i.breakpoints[m].slidesPerView < "u").length > 0;
    for (let m = 0; m < f; m += 1) {
        O = 0;
        let S;
        if (c[m] && (S = c[m]), P && t.grid.updateSlide(m, S, c), !(c[m] && N(S, "display") === "none")) {
            if (i.slidesPerView === "auto") {
                V && (c[m].style[t.getDirectionLabel("width")] = "");
                const E = getComputedStyle(S),
                    x = S.style.transform,
                    I = S.style.webkitTransform;
                if (x && (S.style.transform = "none"), I && (S.style.webkitTransform = "none"), i.roundLengths) O = t.isHorizontal() ? ce(S, "width", !0) : ce(S, "height", !0);
                else {
                    const G = e(E, "width"),
                        C = e(E, "padding-left"),
                        H = e(E, "padding-right"),
                        B = e(E, "margin-left"),
                        A = e(E, "margin-right"),
                        z = E.getPropertyValue("box-sizing");
                    if (z && z === "border-box") O = G + B + A;
                    else {
                        const {
                            clientWidth: R,
                            offsetWidth: j
                        } = S;
                        O = G + C + H + B + A + (j - R)
                    }
                }
                x && (S.style.transform = x), I && (S.style.webkitTransform = I), i.roundLengths && (O = Math.floor(O))
            } else O = (r - (i.slidesPerView - 1) * w) / i.slidesPerView, i.roundLengths && (O = Math.floor(O)), c[m] && (c[m].style[t.getDirectionLabel("width")] = `${O}px`);
            c[m] && (c[m].swiperSlideSize = O), h.push(O), i.centeredSlides ? (T = T + O / 2 + b / 2 + w, b === 0 && m !== 0 && (T = T - r / 2 - w), m === 0 && (T = T - r / 2 - w), Math.abs(T) < 1 / 1e3 && (T = 0), i.roundLengths && (T = Math.floor(T)), L % i.slidesPerGroup === 0 && u.push(T), p.push(T)) : (i.roundLengths && (T = Math.floor(T)), (L - Math.min(t.params.slidesPerGroupSkip, L)) % t.params.slidesPerGroup === 0 && u.push(T), p.push(T), T = T + O + w), t.virtualSize += O + w, b = O, L += 1
        }
    }
    if (t.virtualSize = Math.max(t.virtualSize, r) + y, l && o && (i.effect === "slide" || i.effect === "coverflow") && (s.style.width = `${t.virtualSize+w}px`), i.setWrapperSize && (s.style[t.getDirectionLabel("width")] = `${t.virtualSize+w}px`), P && t.grid.updateWrapperSize(O, u), !i.centeredSlides) {
        const m = [];
        for (let S = 0; S < u.length; S += 1) {
            let E = u[S];
            i.roundLengths && (E = Math.floor(E)), u[S] <= t.virtualSize - r && m.push(E)
        }
        u = m, Math.floor(t.virtualSize - r) - Math.floor(u[u.length - 1]) > 1 && u.push(t.virtualSize - r)
    }
    if (a && i.loop) {
        const m = h[0] + w;
        if (i.slidesPerGroup > 1) {
            const S = Math.ceil((t.virtual.slidesBefore + t.virtual.slidesAfter) / i.slidesPerGroup),
                E = m * i.slidesPerGroup;
            for (let x = 0; x < S; x += 1) u.push(u[u.length - 1] + E)
        }
        for (let S = 0; S < t.virtual.slidesBefore + t.virtual.slidesAfter; S += 1) i.slidesPerGroup === 1 && u.push(u[u.length - 1] + m), p.push(p[p.length - 1] + m), t.virtualSize += m
    }
    if (u.length === 0 && (u = [0]), w !== 0) {
        const m = t.isHorizontal() && l ? "marginLeft" : t.getDirectionLabel("marginRight");
        c.filter((S, E) => !i.cssMode || i.loop ? !0 : E !== c.length - 1).forEach(S => {
            S.style[m] = `${w}px`
        })
    }
    if (i.centeredSlides && i.centeredSlidesBounds) {
        let m = 0;
        h.forEach(E => {
            m += E + (w || 0)
        }), m -= w;
        const S = m - r;
        u = u.map(E => E <= 0 ? -g : E > S ? S + y : E)
    }
    if (i.centerInsufficientSlides) {
        let m = 0;
        if (h.forEach(S => {
                m += S + (w || 0)
            }), m -= w, m < r) {
            const S = (r - m) / 2;
            u.forEach((E, x) => {
                u[x] = E - S
            }), p.forEach((E, x) => {
                p[x] = E + S
            })
        }
    }
    if (Object.assign(t, {
            slides: c,
            snapGrid: u,
            slidesGrid: p,
            slidesSizesGrid: h
        }), i.centeredSlides && i.cssMode && !i.centeredSlidesBounds) {
        Y(s, "--swiper-centered-offset-before", `${-u[0]}px`), Y(s, "--swiper-centered-offset-after", `${t.size/2-h[h.length-1]/2}px`);
        const m = -t.snapGrid[0],
            S = -t.slidesGrid[0];
        t.snapGrid = t.snapGrid.map(E => E + m), t.slidesGrid = t.slidesGrid.map(E => E + S)
    }
    if (f !== d && t.emit("slidesLengthChange"), u.length !== v && (t.params.watchOverflow && t.checkOverflow(), t.emit("snapGridLengthChange")), p.length !== M && t.emit("slidesGridLengthChange"), i.watchSlidesProgress && t.updateSlidesOffset(), t.emit("slidesUpdated"), !a && !i.cssMode && (i.effect === "slide" || i.effect === "fade")) {
        const m = `${i.containerModifierClass}backface-hidden`,
            S = t.el.classList.contains(m);
        f <= i.maxBackfaceHiddenSlides ? S || t.el.classList.add(m) : S && t.el.classList.remove(m)
    }
}

function Ne(t) {
    const e = this,
        i = [],
        s = e.virtual && e.params.virtual.enabled;
    let n = 0,
        r;
    typeof t == "number" ? e.setTransition(t) : t === !0 && e.setTransition(e.params.speed);
    const l = o => s ? e.slides[e.getSlideIndexByData(o)] : e.slides[o];
    if (e.params.slidesPerView !== "auto" && e.params.slidesPerView > 1)
        if (e.params.centeredSlides)(e.visibleSlides || []).forEach(o => {
            i.push(o)
        });
        else
            for (r = 0; r < Math.ceil(e.params.slidesPerView); r += 1) {
                const o = e.activeIndex + r;
                if (o > e.slides.length && !s) break;
                i.push(l(o))
            } else i.push(l(e.activeIndex));
    for (r = 0; r < i.length; r += 1)
        if (typeof i[r] < "u") {
            const o = i[r].offsetHeight;
            n = o > n ? o : n
        }(n || n === 0) && (e.wrapperEl.style.height = `${n}px`)
}

function Be() {
    const t = this,
        e = t.slides,
        i = t.isElement ? t.isHorizontal() ? t.wrapperEl.offsetLeft : t.wrapperEl.offsetTop : 0;
    for (let s = 0; s < e.length; s += 1) e[s].swiperSlideOffset = (t.isHorizontal() ? e[s].offsetLeft : e[s].offsetTop) - i - t.cssOverflowAdjustment()
}

function Re(t) {
    t === void 0 && (t = this && this.translate || 0);
    const e = this,
        i = e.params,
        {
            slides: s,
            rtlTranslate: n,
            snapGrid: r
        } = e;
    if (s.length === 0) return;
    typeof s[0].swiperSlideOffset > "u" && e.updateSlidesOffset();
    let l = -t;
    n && (l = t), s.forEach(a => {
        a.classList.remove(i.slideVisibleClass, i.slideFullyVisibleClass)
    }), e.visibleSlidesIndexes = [], e.visibleSlides = [];
    let o = i.spaceBetween;
    typeof o == "string" && o.indexOf("%") >= 0 ? o = parseFloat(o.replace("%", "")) / 100 * e.size : typeof o == "string" && (o = parseFloat(o));
    for (let a = 0; a < s.length; a += 1) {
        const d = s[a];
        let c = d.swiperSlideOffset;
        i.cssMode && i.centeredSlides && (c -= s[0].swiperSlideOffset);
        const f = (l + (i.centeredSlides ? e.minTranslate() : 0) - c) / (d.swiperSlideSize + o),
            u = (l - r[0] + (i.centeredSlides ? e.minTranslate() : 0) - c) / (d.swiperSlideSize + o),
            p = -(l - c),
            h = p + e.slidesSizesGrid[a],
            g = p >= 0 && p <= e.size - e.slidesSizesGrid[a];
        (p >= 0 && p < e.size - 1 || h > 1 && h <= e.size || p <= 0 && h >= e.size) && (e.visibleSlides.push(d), e.visibleSlidesIndexes.push(a), s[a].classList.add(i.slideVisibleClass)), g && s[a].classList.add(i.slideFullyVisibleClass), d.progress = n ? -f : f, d.originalProgress = n ? -u : u
    }
}

function $e(t) {
    const e = this;
    if (typeof t > "u") {
        const c = e.rtlTranslate ? -1 : 1;
        t = e && e.translate && e.translate * c || 0
    }
    const i = e.params,
        s = e.maxTranslate() - e.minTranslate();
    let {
        progress: n,
        isBeginning: r,
        isEnd: l,
        progressLoop: o
    } = e;
    const a = r,
        d = l;
    if (s === 0) n = 0, r = !0, l = !0;
    else {
        n = (t - e.minTranslate()) / s;
        const c = Math.abs(t - e.minTranslate()) < 1,
            f = Math.abs(t - e.maxTranslate()) < 1;
        r = c || n <= 0, l = f || n >= 1, c && (n = 0), f && (n = 1)
    }
    if (i.loop) {
        const c = e.getSlideIndexByData(0),
            f = e.getSlideIndexByData(e.slides.length - 1),
            u = e.slidesGrid[c],
            p = e.slidesGrid[f],
            h = e.slidesGrid[e.slidesGrid.length - 1],
            g = Math.abs(t);
        g >= u ? o = (g - u) / h : o = (g + h - p) / h, o > 1 && (o -= 1)
    }
    Object.assign(e, {
        progress: n,
        progressLoop: o,
        isBeginning: r,
        isEnd: l
    }), (i.watchSlidesProgress || i.centeredSlides && i.autoHeight) && e.updateSlidesProgress(t), r && !a && e.emit("reachBeginning toEdge"), l && !d && e.emit("reachEnd toEdge"), (a && !r || d && !l) && e.emit("fromEdge"), e.emit("progress", n)
}

function He() {
    const t = this,
        {
            slides: e,
            params: i,
            slidesEl: s,
            activeIndex: n
        } = t,
        r = t.virtual && i.virtual.enabled,
        l = t.grid && i.grid && i.grid.rows > 1,
        o = f => _(s, `.${i.slideClass}${f}, swiper-slide${f}`)[0];
    e.forEach(f => {
        f.classList.remove(i.slideActiveClass, i.slideNextClass, i.slidePrevClass)
    });
    let a, d, c;
    if (r)
        if (i.loop) {
            let f = n - t.virtual.slidesBefore;
            f < 0 && (f = t.virtual.slides.length + f), f >= t.virtual.slides.length && (f -= t.virtual.slides.length), a = o(`[data-swiper-slide-index="${f}"]`)
        } else a = o(`[data-swiper-slide-index="${n}"]`);
    else l ? (a = e.filter(f => f.column === n)[0], c = e.filter(f => f.column === n + 1)[0], d = e.filter(f => f.column === n - 1)[0]) : a = e[n];
    a && (a.classList.add(i.slideActiveClass), l ? (c && c.classList.add(i.slideNextClass), d && d.classList.add(i.slidePrevClass)) : (c = Ie(a, `.${i.slideClass}, swiper-slide`)[0], i.loop && !c && (c = e[0]), c && c.classList.add(i.slideNextClass), d = Pe(a, `.${i.slideClass}, swiper-slide`)[0], i.loop && !d === 0 && (d = e[e.length - 1]), d && d.classList.add(i.slidePrevClass))), t.emitSlidesClasses()
}
const X = (t, e) => {
        if (!t || t.destroyed || !t.params) return;
        const i = () => t.isElement ? "swiper-slide" : `.${t.params.slideClass}`,
            s = e.closest(i());
        if (s) {
            let n = s.querySelector(`.${t.params.lazyPreloaderClass}`);
            !n && t.isElement && (s.shadowRoot ? n = s.shadowRoot.querySelector(`.${t.params.lazyPreloaderClass}`) : requestAnimationFrame(() => {
                s.shadowRoot && (n = s.shadowRoot.querySelector(`.${t.params.lazyPreloaderClass}`), n && n.remove())
            })), n && n.remove()
        }
    },
    te = (t, e) => {
        if (!t.slides[e]) return;
        const i = t.slides[e].querySelector('[loading="lazy"]');
        i && i.removeAttribute("loading")
    },
    ae = t => {
        if (!t || t.destroyed || !t.params) return;
        let e = t.params.lazyPreloadPrevNext;
        const i = t.slides.length;
        if (!i || !e || e < 0) return;
        e = Math.min(e, i);
        const s = t.params.slidesPerView === "auto" ? t.slidesPerViewDynamic() : Math.ceil(t.params.slidesPerView),
            n = t.activeIndex;
        if (t.params.grid && t.params.grid.rows > 1) {
            const l = n,
                o = [l - e];
            o.push(...Array.from({
                length: e
            }).map((a, d) => l + s + d)), t.slides.forEach((a, d) => {
                o.includes(a.column) && te(t, d)
            });
            return
        }
        const r = n + s - 1;
        if (t.params.rewind || t.params.loop)
            for (let l = n - e; l <= r + e; l += 1) {
                const o = (l % i + i) % i;
                (o < n || o > r) && te(t, o)
            } else
                for (let l = Math.max(n - e, 0); l <= Math.min(r + e, i - 1); l += 1) l !== n && (l > r || l < n) && te(t, l)
    };

function We(t) {
    const {
        slidesGrid: e,
        params: i
    } = t, s = t.rtlTranslate ? t.translate : -t.translate;
    let n;
    for (let r = 0; r < e.length; r += 1) typeof e[r + 1] < "u" ? s >= e[r] && s < e[r + 1] - (e[r + 1] - e[r]) / 2 ? n = r : s >= e[r] && s < e[r + 1] && (n = r + 1) : s >= e[r] && (n = r);
    return i.normalizeSlideIndex && (n < 0 || typeof n > "u") && (n = 0), n
}

function je(t) {
    const e = this,
        i = e.rtlTranslate ? e.translate : -e.translate,
        {
            snapGrid: s,
            params: n,
            activeIndex: r,
            realIndex: l,
            snapIndex: o
        } = e;
    let a = t,
        d;
    const c = p => {
        let h = p - e.virtual.slidesBefore;
        return h < 0 && (h = e.virtual.slides.length + h), h >= e.virtual.slides.length && (h -= e.virtual.slides.length), h
    };
    if (typeof a > "u" && (a = We(e)), s.indexOf(i) >= 0) d = s.indexOf(i);
    else {
        const p = Math.min(n.slidesPerGroupSkip, a);
        d = p + Math.floor((a - p) / n.slidesPerGroup)
    }
    if (d >= s.length && (d = s.length - 1), a === r && !e.params.loop) {
        d !== o && (e.snapIndex = d, e.emit("snapIndexChange"));
        return
    }
    if (a === r && e.params.loop && e.virtual && e.params.virtual.enabled) {
        e.realIndex = c(a);
        return
    }
    const f = e.grid && n.grid && n.grid.rows > 1;
    let u;
    if (e.virtual && n.virtual.enabled && n.loop) u = c(a);
    else if (f) {
        const p = e.slides.filter(g => g.column === a)[0];
        let h = parseInt(p.getAttribute("data-swiper-slide-index"), 10);
        Number.isNaN(h) && (h = Math.max(e.slides.indexOf(p), 0)), u = Math.floor(h / n.grid.rows)
    } else if (e.slides[a]) {
        const p = e.slides[a].getAttribute("data-swiper-slide-index");
        p ? u = parseInt(p, 10) : u = a
    } else u = a;
    Object.assign(e, {
        previousSnapIndex: o,
        snapIndex: d,
        previousRealIndex: l,
        realIndex: u,
        previousIndex: r,
        activeIndex: a
    }), e.initialized && ae(e), e.emit("activeIndexChange"), e.emit("snapIndexChange"), (e.initialized || e.params.runCallbacksOnInit) && (l !== u && e.emit("realIndexChange"), e.emit("slideChange"))
}

function qe(t, e) {
    const i = this,
        s = i.params;
    let n = t.closest(`.${s.slideClass}, swiper-slide`);
    !n && i.isElement && e && e.length > 1 && e.includes(t) && [...e.slice(e.indexOf(t) + 1, e.length)].forEach(o => {
        !n && o.matches && o.matches(`.${s.slideClass}, swiper-slide`) && (n = o)
    });
    let r = !1,
        l;
    if (n) {
        for (let o = 0; o < i.slides.length; o += 1)
            if (i.slides[o] === n) {
                r = !0, l = o;
                break
            }
    }
    if (n && r) i.clickedSlide = n, i.virtual && i.params.virtual.enabled ? i.clickedIndex = parseInt(n.getAttribute("data-swiper-slide-index"), 10) : i.clickedIndex = l;
    else {
        i.clickedSlide = void 0, i.clickedIndex = void 0;
        return
    }
    s.slideToClickedSlide && i.clickedIndex !== void 0 && i.clickedIndex !== i.activeIndex && i.slideToClickedSlide()
}
var Ye = {
    updateSize: Fe,
    updateSlides: _e,
    updateAutoHeight: Ne,
    updateSlidesOffset: Be,
    updateSlidesProgress: Re,
    updateProgress: $e,
    updateSlidesClasses: He,
    updateActiveIndex: je,
    updateClickedSlide: qe
};

function Xe(t) {
    t === void 0 && (t = this.isHorizontal() ? "x" : "y");
    const e = this,
        {
            params: i,
            rtlTranslate: s,
            translate: n,
            wrapperEl: r
        } = e;
    if (i.virtualTranslate) return s ? -n : n;
    if (i.cssMode) return n;
    let l = Ee(r, t);
    return l += e.cssOverflowAdjustment(), s && (l = -l), l || 0
}

function Ke(t, e) {
    const i = this,
        {
            rtlTranslate: s,
            params: n,
            wrapperEl: r,
            progress: l
        } = i;
    let o = 0,
        a = 0;
    const d = 0;
    i.isHorizontal() ? o = s ? -t : t : a = t, n.roundLengths && (o = Math.floor(o), a = Math.floor(a)), i.previousTranslate = i.translate, i.translate = i.isHorizontal() ? o : a, n.cssMode ? r[i.isHorizontal() ? "scrollLeft" : "scrollTop"] = i.isHorizontal() ? -o : -a : n.virtualTranslate || (i.isHorizontal() ? o -= i.cssOverflowAdjustment() : a -= i.cssOverflowAdjustment(), r.style.transform = `translate3d(${o}px, ${a}px, ${d}px)`);
    let c;
    const f = i.maxTranslate() - i.minTranslate();
    f === 0 ? c = 0 : c = (t - i.minTranslate()) / f, c !== l && i.updateProgress(t), i.emit("setTranslate", i.translate, e)
}

function Ue() {
    return -this.snapGrid[0]
}

function Je() {
    return -this.snapGrid[this.snapGrid.length - 1]
}

function Qe(t, e, i, s, n) {
    t === void 0 && (t = 0), e === void 0 && (e = this.params.speed), i === void 0 && (i = !0), s === void 0 && (s = !0);
    const r = this,
        {
            params: l,
            wrapperEl: o
        } = r;
    if (r.animating && l.preventInteractionOnTransition) return !1;
    const a = r.minTranslate(),
        d = r.maxTranslate();
    let c;
    if (s && t > a ? c = a : s && t < d ? c = d : c = t, r.updateProgress(c), l.cssMode) {
        const f = r.isHorizontal();
        if (e === 0) o[f ? "scrollLeft" : "scrollTop"] = -c;
        else {
            if (!r.support.smoothScroll) return ge({
                swiper: r,
                targetPosition: -c,
                side: f ? "left" : "top"
            }), !0;
            o.scrollTo({
                [f ? "left" : "top"]: -c,
                behavior: "smooth"
            })
        }
        return !0
    }
    return e === 0 ? (r.setTransition(0), r.setTranslate(c), i && (r.emit("beforeTransitionStart", e, n), r.emit("transitionEnd"))) : (r.setTransition(e), r.setTranslate(c), i && (r.emit("beforeTransitionStart", e, n), r.emit("transitionStart")), r.animating || (r.animating = !0, r.onTranslateToWrapperTransitionEnd || (r.onTranslateToWrapperTransitionEnd = function(u) {
        !r || r.destroyed || u.target === this && (r.wrapperEl.removeEventListener("transitionend", r.onTranslateToWrapperTransitionEnd), r.onTranslateToWrapperTransitionEnd = null, delete r.onTranslateToWrapperTransitionEnd, i && r.emit("transitionEnd"))
    }), r.wrapperEl.addEventListener("transitionend", r.onTranslateToWrapperTransitionEnd))), !0
}
var Ze = {
    getTranslate: Xe,
    setTranslate: Ke,
    minTranslate: Ue,
    maxTranslate: Je,
    translateTo: Qe
};

function et(t, e) {
    const i = this;
    i.params.cssMode || (i.wrapperEl.style.transitionDuration = `${t}ms`, i.wrapperEl.style.transitionDelay = t === 0 ? "0ms" : ""), i.emit("setTransition", t, e)
}

function we(t) {
    let {
        swiper: e,
        runCallbacks: i,
        direction: s,
        step: n
    } = t;
    const {
        activeIndex: r,
        previousIndex: l
    } = e;
    let o = s;
    if (o || (r > l ? o = "next" : r < l ? o = "prev" : o = "reset"), e.emit(`transition${n}`), i && r !== l) {
        if (o === "reset") {
            e.emit(`slideResetTransition${n}`);
            return
        }
        e.emit(`slideChangeTransition${n}`), o === "next" ? e.emit(`slideNextTransition${n}`) : e.emit(`slidePrevTransition${n}`)
    }
}

function tt(t, e) {
    t === void 0 && (t = !0);
    const i = this,
        {
            params: s
        } = i;
    s.cssMode || (s.autoHeight && i.updateAutoHeight(), we({
        swiper: i,
        runCallbacks: t,
        direction: e,
        step: "Start"
    }))
}

function it(t, e) {
    t === void 0 && (t = !0);
    const i = this,
        {
            params: s
        } = i;
    i.animating = !1, !s.cssMode && (i.setTransition(0), we({
        swiper: i,
        runCallbacks: t,
        direction: e,
        step: "End"
    }))
}
var st = {
    setTransition: et,
    transitionStart: tt,
    transitionEnd: it
};

function rt(t, e, i, s, n) {
    t === void 0 && (t = 0), e === void 0 && (e = this.params.speed), i === void 0 && (i = !0), typeof t == "string" && (t = parseInt(t, 10));
    const r = this;
    let l = t;
    l < 0 && (l = 0);
    const {
        params: o,
        snapGrid: a,
        slidesGrid: d,
        previousIndex: c,
        activeIndex: f,
        rtlTranslate: u,
        wrapperEl: p,
        enabled: h
    } = r;
    if (r.animating && o.preventInteractionOnTransition || !h && !s && !n) return !1;
    const g = Math.min(r.params.slidesPerGroupSkip, l);
    let y = g + Math.floor((l - g) / r.params.slidesPerGroup);
    y >= a.length && (y = a.length - 1);
    const v = -a[y];
    if (o.normalizeSlideIndex)
        for (let w = 0; w < d.length; w += 1) {
            const T = -Math.floor(v * 100),
                b = Math.floor(d[w] * 100),
                L = Math.floor(d[w + 1] * 100);
            typeof d[w + 1] < "u" ? T >= b && T < L - (L - b) / 2 ? l = w : T >= b && T < L && (l = w + 1) : T >= b && (l = w)
        }
    if (r.initialized && l !== f && (!r.allowSlideNext && (u ? v > r.translate && v > r.minTranslate() : v < r.translate && v < r.minTranslate()) || !r.allowSlidePrev && v > r.translate && v > r.maxTranslate() && (f || 0) !== l)) return !1;
    l !== (c || 0) && i && r.emit("beforeSlideChangeStart"), r.updateProgress(v);
    let M;
    if (l > f ? M = "next" : l < f ? M = "prev" : M = "reset", u && -v === r.translate || !u && v === r.translate) return r.updateActiveIndex(l), o.autoHeight && r.updateAutoHeight(), r.updateSlidesClasses(), o.effect !== "slide" && r.setTranslate(v), M !== "reset" && (r.transitionStart(i, M), r.transitionEnd(i, M)), !1;
    if (o.cssMode) {
        const w = r.isHorizontal(),
            T = u ? v : -v;
        if (e === 0) {
            const b = r.virtual && r.params.virtual.enabled;
            b && (r.wrapperEl.style.scrollSnapType = "none", r._immediateVirtual = !0), b && !r._cssModeVirtualInitialSet && r.params.initialSlide > 0 ? (r._cssModeVirtualInitialSet = !0, requestAnimationFrame(() => {
                p[w ? "scrollLeft" : "scrollTop"] = T
            })) : p[w ? "scrollLeft" : "scrollTop"] = T, b && requestAnimationFrame(() => {
                r.wrapperEl.style.scrollSnapType = "", r._immediateVirtual = !1
            })
        } else {
            if (!r.support.smoothScroll) return ge({
                swiper: r,
                targetPosition: T,
                side: w ? "left" : "top"
            }), !0;
            p.scrollTo({
                [w ? "left" : "top"]: T,
                behavior: "smooth"
            })
        }
        return !0
    }
    return r.setTransition(e), r.setTranslate(v), r.updateActiveIndex(l), r.updateSlidesClasses(), r.emit("beforeTransitionStart", e, s), r.transitionStart(i, M), e === 0 ? r.transitionEnd(i, M) : r.animating || (r.animating = !0, r.onSlideToWrapperTransitionEnd || (r.onSlideToWrapperTransitionEnd = function(T) {
        !r || r.destroyed || T.target === this && (r.wrapperEl.removeEventListener("transitionend", r.onSlideToWrapperTransitionEnd), r.onSlideToWrapperTransitionEnd = null, delete r.onSlideToWrapperTransitionEnd, r.transitionEnd(i, M))
    }), r.wrapperEl.addEventListener("transitionend", r.onSlideToWrapperTransitionEnd)), !0
}

function nt(t, e, i, s) {
    t === void 0 && (t = 0), e === void 0 && (e = this.params.speed), i === void 0 && (i = !0), typeof t == "string" && (t = parseInt(t, 10));
    const n = this,
        r = n.grid && n.params.grid && n.params.grid.rows > 1;
    let l = t;
    if (n.params.loop)
        if (n.virtual && n.params.virtual.enabled) l = l + n.virtual.slidesBefore;
        else {
            let o;
            if (r) {
                const u = l * n.params.grid.rows;
                o = n.slides.filter(p => p.getAttribute("data-swiper-slide-index") * 1 === u)[0].column
            } else o = n.getSlideIndexByData(l);
            const a = r ? Math.ceil(n.slides.length / n.params.grid.rows) : n.slides.length,
                {
                    centeredSlides: d
                } = n.params;
            let c = n.params.slidesPerView;
            c === "auto" ? c = n.slidesPerViewDynamic() : (c = Math.ceil(parseFloat(n.params.slidesPerView, 10)), d && c % 2 === 0 && (c = c + 1));
            let f = a - o < c;
            if (d && (f = f || o < Math.ceil(c / 2)), f) {
                const u = d ? o < n.activeIndex ? "prev" : "next" : o - n.activeIndex - 1 < n.params.slidesPerView ? "next" : "prev";
                n.loopFix({
                    direction: u,
                    slideTo: !0,
                    activeSlideIndex: u === "next" ? o + 1 : o - a + 1,
                    slideRealIndex: u === "next" ? n.realIndex : void 0
                })
            }
            if (r) {
                const u = l * n.params.grid.rows;
                l = n.slides.filter(p => p.getAttribute("data-swiper-slide-index") * 1 === u)[0].column
            } else l = n.getSlideIndexByData(l)
        }
    return requestAnimationFrame(() => {
        n.slideTo(l, e, i, s)
    }), n
}

function at(t, e, i) {
    t === void 0 && (t = this.params.speed), e === void 0 && (e = !0);
    const s = this,
        {
            enabled: n,
            params: r,
            animating: l
        } = s;
    if (!n) return s;
    let o = r.slidesPerGroup;
    r.slidesPerView === "auto" && r.slidesPerGroup === 1 && r.slidesPerGroupAuto && (o = Math.max(s.slidesPerViewDynamic("current", !0), 1));
    const a = s.activeIndex < r.slidesPerGroupSkip ? 1 : o,
        d = s.virtual && r.virtual.enabled;
    if (r.loop) {
        if (l && !d && r.loopPreventsSliding) return !1;
        if (s.loopFix({
                direction: "next"
            }), s._clientLeft = s.wrapperEl.clientLeft, s.activeIndex === s.slides.length - 1 && r.cssMode) return requestAnimationFrame(() => {
            s.slideTo(s.activeIndex + a, t, e, i)
        }), !0
    }
    return r.rewind && s.isEnd ? s.slideTo(0, t, e, i) : s.slideTo(s.activeIndex + a, t, e, i)
}

function lt(t, e, i) {
    t === void 0 && (t = this.params.speed), e === void 0 && (e = !0);
    const s = this,
        {
            params: n,
            snapGrid: r,
            slidesGrid: l,
            rtlTranslate: o,
            enabled: a,
            animating: d
        } = s;
    if (!a) return s;
    const c = s.virtual && n.virtual.enabled;
    if (n.loop) {
        if (d && !c && n.loopPreventsSliding) return !1;
        s.loopFix({
            direction: "prev"
        }), s._clientLeft = s.wrapperEl.clientLeft
    }
    const f = o ? s.translate : -s.translate;

    function u(v) {
        return v < 0 ? -Math.floor(Math.abs(v)) : Math.floor(v)
    }
    const p = u(f),
        h = r.map(v => u(v));
    let g = r[h.indexOf(p) - 1];
    if (typeof g > "u" && n.cssMode) {
        let v;
        r.forEach((M, w) => {
            p >= M && (v = w)
        }), typeof v < "u" && (g = r[v > 0 ? v - 1 : v])
    }
    let y = 0;
    if (typeof g < "u" && (y = l.indexOf(g), y < 0 && (y = s.activeIndex - 1), n.slidesPerView === "auto" && n.slidesPerGroup === 1 && n.slidesPerGroupAuto && (y = y - s.slidesPerViewDynamic("previous", !0) + 1, y = Math.max(y, 0))), n.rewind && s.isBeginning) {
        const v = s.params.virtual && s.params.virtual.enabled && s.virtual ? s.virtual.slides.length - 1 : s.slides.length - 1;
        return s.slideTo(v, t, e, i)
    } else if (n.loop && s.activeIndex === 0 && n.cssMode) return requestAnimationFrame(() => {
        s.slideTo(y, t, e, i)
    }), !0;
    return s.slideTo(y, t, e, i)
}

function ot(t, e, i) {
    t === void 0 && (t = this.params.speed), e === void 0 && (e = !0);
    const s = this;
    return s.slideTo(s.activeIndex, t, e, i)
}

function dt(t, e, i, s) {
    t === void 0 && (t = this.params.speed), e === void 0 && (e = !0), s === void 0 && (s = .5);
    const n = this;
    let r = n.activeIndex;
    const l = Math.min(n.params.slidesPerGroupSkip, r),
        o = l + Math.floor((r - l) / n.params.slidesPerGroup),
        a = n.rtlTranslate ? n.translate : -n.translate;
    if (a >= n.snapGrid[o]) {
        const d = n.snapGrid[o],
            c = n.snapGrid[o + 1];
        a - d > (c - d) * s && (r += n.params.slidesPerGroup)
    } else {
        const d = n.snapGrid[o - 1],
            c = n.snapGrid[o];
        a - d <= (c - d) * s && (r -= n.params.slidesPerGroup)
    }
    return r = Math.max(r, 0), r = Math.min(r, n.slidesGrid.length - 1), n.slideTo(r, t, e, i)
}

function ct() {
    const t = this,
        {
            params: e,
            slidesEl: i
        } = t,
        s = e.slidesPerView === "auto" ? t.slidesPerViewDynamic() : e.slidesPerView;
    let n = t.clickedIndex,
        r;
    const l = t.isElement ? "swiper-slide" : `.${e.slideClass}`;
    if (e.loop) {
        if (t.animating) return;
        r = parseInt(t.clickedSlide.getAttribute("data-swiper-slide-index"), 10), e.centeredSlides ? n < t.loopedSlides - s / 2 || n > t.slides.length - t.loopedSlides + s / 2 ? (t.loopFix(), n = t.getSlideIndex(_(i, `${l}[data-swiper-slide-index="${r}"]`)[0]), re(() => {
            t.slideTo(n)
        })) : t.slideTo(n) : n > t.slides.length - s ? (t.loopFix(), n = t.getSlideIndex(_(i, `${l}[data-swiper-slide-index="${r}"]`)[0]), re(() => {
            t.slideTo(n)
        })) : t.slideTo(n)
    } else t.slideTo(n)
}
var ft = {
    slideTo: rt,
    slideToLoop: nt,
    slideNext: at,
    slidePrev: lt,
    slideReset: ot,
    slideToClosest: dt,
    slideToClickedSlide: ct
};

function ut(t) {
    const e = this,
        {
            params: i,
            slidesEl: s
        } = e;
    if (!i.loop || e.virtual && e.params.virtual.enabled) return;
    const n = () => {
            _(s, `.${i.slideClass}, swiper-slide`).forEach((f, u) => {
                f.setAttribute("data-swiper-slide-index", u)
            })
        },
        r = e.grid && i.grid && i.grid.rows > 1,
        l = i.slidesPerGroup * (r ? i.grid.rows : 1),
        o = e.slides.length % l !== 0,
        a = r && e.slides.length % i.grid.rows !== 0,
        d = c => {
            for (let f = 0; f < c; f += 1) {
                const u = e.isElement ? ne("swiper-slide", [i.slideBlankClass]) : ne("div", [i.slideClass, i.slideBlankClass]);
                e.slidesEl.append(u)
            }
        };
    if (o) {
        if (i.loopAddBlankSlides) {
            const c = l - e.slides.length % l;
            d(c), e.recalcSlides(), e.updateSlides()
        } else U("Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
        n()
    } else if (a) {
        if (i.loopAddBlankSlides) {
            const c = i.grid.rows - e.slides.length % i.grid.rows;
            d(c), e.recalcSlides(), e.updateSlides()
        } else U("Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)");
        n()
    } else n();
    e.loopFix({
        slideRealIndex: t,
        direction: i.centeredSlides ? void 0 : "next"
    })
}

function pt(t) {
    let {
        slideRealIndex: e,
        slideTo: i = !0,
        direction: s,
        setTranslate: n,
        activeSlideIndex: r,
        byController: l,
        byMousewheel: o
    } = t === void 0 ? {} : t;
    const a = this;
    if (!a.params.loop) return;
    a.emit("beforeLoopFix");
    const {
        slides: d,
        allowSlidePrev: c,
        allowSlideNext: f,
        slidesEl: u,
        params: p
    } = a, {
        centeredSlides: h
    } = p;
    if (a.allowSlidePrev = !0, a.allowSlideNext = !0, a.virtual && p.virtual.enabled) {
        i && (!p.centeredSlides && a.snapIndex === 0 ? a.slideTo(a.virtual.slides.length, 0, !1, !0) : p.centeredSlides && a.snapIndex < p.slidesPerView ? a.slideTo(a.virtual.slides.length + a.snapIndex, 0, !1, !0) : a.snapIndex === a.snapGrid.length - 1 && a.slideTo(a.virtual.slidesBefore, 0, !1, !0)), a.allowSlidePrev = c, a.allowSlideNext = f, a.emit("loopFix");
        return
    }
    let g = p.slidesPerView;
    g === "auto" ? g = a.slidesPerViewDynamic() : (g = Math.ceil(parseFloat(p.slidesPerView, 10)), h && g % 2 === 0 && (g = g + 1));
    const y = p.slidesPerGroupAuto ? g : p.slidesPerGroup;
    let v = y;
    v % y !== 0 && (v += y - v % y), v += p.loopAdditionalSlides, a.loopedSlides = v;
    const M = a.grid && p.grid && p.grid.rows > 1;
    d.length < g + v ? U("Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters") : M && p.grid.fill === "row" && U("Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`");
    const w = [],
        T = [];
    let b = a.activeIndex;
    typeof r > "u" ? r = a.getSlideIndex(d.filter(x => x.classList.contains(p.slideActiveClass))[0]) : b = r;
    const L = s === "next" || !s,
        P = s === "prev" || !s;
    let O = 0,
        V = 0;
    const m = M ? Math.ceil(d.length / p.grid.rows) : d.length,
        E = (M ? d[r].column : r) + (h && typeof n > "u" ? -g / 2 + .5 : 0);
    if (E < v) {
        O = Math.max(v - E, y);
        for (let x = 0; x < v - E; x += 1) {
            const I = x - Math.floor(x / m) * m;
            if (M) {
                const G = m - I - 1;
                for (let C = d.length - 1; C >= 0; C -= 1) d[C].column === G && w.push(C)
            } else w.push(m - I - 1)
        }
    } else if (E + g > m - v) {
        V = Math.max(E - (m - v * 2), y);
        for (let x = 0; x < V; x += 1) {
            const I = x - Math.floor(x / m) * m;
            M ? d.forEach((G, C) => {
                G.column === I && T.push(C)
            }) : T.push(I)
        }
    }
    if (a.__preventObserver__ = !0, requestAnimationFrame(() => {
            a.__preventObserver__ = !1
        }), P && w.forEach(x => {
            d[x].swiperLoopMoveDOM = !0, u.prepend(d[x]), d[x].swiperLoopMoveDOM = !1
        }), L && T.forEach(x => {
            d[x].swiperLoopMoveDOM = !0, u.append(d[x]), d[x].swiperLoopMoveDOM = !1
        }), a.recalcSlides(), p.slidesPerView === "auto" ? a.updateSlides() : M && (w.length > 0 && P || T.length > 0 && L) && a.slides.forEach((x, I) => {
            a.grid.updateSlide(I, x, a.slides)
        }), p.watchSlidesProgress && a.updateSlidesOffset(), i) {
        if (w.length > 0 && P) {
            if (typeof e > "u") {
                const x = a.slidesGrid[b],
                    G = a.slidesGrid[b + O] - x;
                o ? a.setTranslate(a.translate - G) : (a.slideTo(b + O, 0, !1, !0), n && (a.touchEventsData.startTranslate = a.touchEventsData.startTranslate - G, a.touchEventsData.currentTranslate = a.touchEventsData.currentTranslate - G))
            } else if (n) {
                const x = M ? w.length / p.grid.rows : w.length;
                a.slideTo(a.activeIndex + x, 0, !1, !0), a.touchEventsData.currentTranslate = a.translate
            }
        } else if (T.length > 0 && L)
            if (typeof e > "u") {
                const x = a.slidesGrid[b],
                    G = a.slidesGrid[b - V] - x;
                o ? a.setTranslate(a.translate - G) : (a.slideTo(b - V, 0, !1, !0), n && (a.touchEventsData.startTranslate = a.touchEventsData.startTranslate - G, a.touchEventsData.currentTranslate = a.touchEventsData.currentTranslate - G))
            } else {
                const x = M ? T.length / p.grid.rows : T.length;
                a.slideTo(a.activeIndex - x, 0, !1, !0)
            }
    }
    if (a.allowSlidePrev = c, a.allowSlideNext = f, a.controller && a.controller.control && !l) {
        const x = {
            slideRealIndex: e,
            direction: s,
            setTranslate: n,
            activeSlideIndex: r,
            byController: !0
        };
        Array.isArray(a.controller.control) ? a.controller.control.forEach(I => {
            !I.destroyed && I.params.loop && I.loopFix({ ...x,
                slideTo: I.params.slidesPerView === p.slidesPerView ? i : !1
            })
        }) : a.controller.control instanceof a.constructor && a.controller.control.params.loop && a.controller.control.loopFix({ ...x,
            slideTo: a.controller.control.params.slidesPerView === p.slidesPerView ? i : !1
        })
    }
    a.emit("loopFix")
}

function mt() {
    const t = this,
        {
            params: e,
            slidesEl: i
        } = t;
    if (!e.loop || t.virtual && t.params.virtual.enabled) return;
    t.recalcSlides();
    const s = [];
    t.slides.forEach(n => {
        const r = typeof n.swiperSlideIndex > "u" ? n.getAttribute("data-swiper-slide-index") * 1 : n.swiperSlideIndex;
        s[r] = n
    }), t.slides.forEach(n => {
        n.removeAttribute("data-swiper-slide-index")
    }), s.forEach(n => {
        i.append(n)
    }), t.recalcSlides(), t.slideTo(t.realIndex, 0)
}
var ht = {
    loopCreate: ut,
    loopFix: pt,
    loopDestroy: mt
};

function gt(t) {
    const e = this;
    if (!e.params.simulateTouch || e.params.watchOverflow && e.isLocked || e.params.cssMode) return;
    const i = e.params.touchEventsTarget === "container" ? e.el : e.wrapperEl;
    e.isElement && (e.__preventObserver__ = !0), i.style.cursor = "move", i.style.cursor = t ? "grabbing" : "grab", e.isElement && requestAnimationFrame(() => {
        e.__preventObserver__ = !1
    })
}

function vt() {
    const t = this;
    t.params.watchOverflow && t.isLocked || t.params.cssMode || (t.isElement && (t.__preventObserver__ = !0), t[t.params.touchEventsTarget === "container" ? "el" : "wrapperEl"].style.cursor = "", t.isElement && requestAnimationFrame(() => {
        t.__preventObserver__ = !1
    }))
}
var wt = {
    setGrabCursor: gt,
    unsetGrabCursor: vt
};

function St(t, e) {
    e === void 0 && (e = this);

    function i(s) {
        if (!s || s === $() || s === D()) return null;
        s.assignedSlot && (s = s.assignedSlot);
        const n = s.closest(t);
        return !n && !s.getRootNode ? null : n || i(s.getRootNode().host)
    }
    return i(e)
}

function fe(t, e, i) {
    const s = D(),
        {
            params: n
        } = t,
        r = n.edgeSwipeDetection,
        l = n.edgeSwipeThreshold;
    return r && (i <= l || i >= s.innerWidth - l) ? r === "prevent" ? (e.preventDefault(), !0) : !1 : !0
}

function Tt(t) {
    const e = this,
        i = $();
    let s = t;
    s.originalEvent && (s = s.originalEvent);
    const n = e.touchEventsData;
    if (s.type === "pointerdown") {
        if (n.pointerId !== null && n.pointerId !== s.pointerId) return;
        n.pointerId = s.pointerId
    } else s.type === "touchstart" && s.targetTouches.length === 1 && (n.touchId = s.targetTouches[0].identifier);
    if (s.type === "touchstart") {
        fe(e, s, s.targetTouches[0].pageX);
        return
    }
    const {
        params: r,
        touches: l,
        enabled: o
    } = e;
    if (!o || !r.simulateTouch && s.pointerType === "mouse" || e.animating && r.preventInteractionOnTransition) return;
    !e.animating && r.cssMode && r.loop && e.loopFix();
    let a = s.target;
    if (r.touchEventsTarget === "wrapper" && !e.wrapperEl.contains(a) || "which" in s && s.which === 3 || "button" in s && s.button > 0 || n.isTouched && n.isMoved) return;
    const d = !!r.noSwipingClass && r.noSwipingClass !== "",
        c = s.composedPath ? s.composedPath() : s.path;
    d && s.target && s.target.shadowRoot && c && (a = c[0]);
    const f = r.noSwipingSelector ? r.noSwipingSelector : `.${r.noSwipingClass}`,
        u = !!(s.target && s.target.shadowRoot);
    if (r.noSwiping && (u ? St(f, a) : a.closest(f))) {
        e.allowClick = !0;
        return
    }
    if (r.swipeHandler && !a.closest(r.swipeHandler)) return;
    l.currentX = s.pageX, l.currentY = s.pageY;
    const p = l.currentX,
        h = l.currentY;
    if (!fe(e, s, p)) return;
    Object.assign(n, {
        isTouched: !0,
        isMoved: !1,
        allowTouchCallbacks: !0,
        isScrolling: void 0,
        startMoving: void 0
    }), l.startX = p, l.startY = h, n.touchStartTime = K(), e.allowClick = !0, e.updateSize(), e.swipeDirection = void 0, r.threshold > 0 && (n.allowThresholdMove = !1);
    let g = !0;
    a.matches(n.focusableElements) && (g = !1, a.nodeName === "SELECT" && (n.isTouched = !1)), i.activeElement && i.activeElement.matches(n.focusableElements) && i.activeElement !== a && i.activeElement.blur();
    const y = g && e.allowTouchMove && r.touchStartPreventDefault;
    (r.touchStartForcePreventDefault || y) && !a.isContentEditable && s.preventDefault(), r.freeMode && r.freeMode.enabled && e.freeMode && e.animating && !r.cssMode && e.freeMode.onTouchStart(), e.emit("touchStart", s)
}

function xt(t) {
    const e = $(),
        i = this,
        s = i.touchEventsData,
        {
            params: n,
            touches: r,
            rtlTranslate: l,
            enabled: o
        } = i;
    if (!o || !n.simulateTouch && t.pointerType === "mouse") return;
    let a = t;
    if (a.originalEvent && (a = a.originalEvent), a.type === "pointermove" && (s.touchId !== null || a.pointerId !== s.pointerId)) return;
    let d;
    if (a.type === "touchmove") {
        if (d = [...a.changedTouches].filter(L => L.identifier === s.touchId)[0], !d || d.identifier !== s.touchId) return
    } else d = a;
    if (!s.isTouched) {
        s.startMoving && s.isScrolling && i.emit("touchMoveOpposite", a);
        return
    }
    const c = d.pageX,
        f = d.pageY;
    if (a.preventedByNestedSwiper) {
        r.startX = c, r.startY = f;
        return
    }
    if (!i.allowTouchMove) {
        a.target.matches(s.focusableElements) || (i.allowClick = !1), s.isTouched && (Object.assign(r, {
            startX: c,
            startY: f,
            currentX: c,
            currentY: f
        }), s.touchStartTime = K());
        return
    }
    if (n.touchReleaseOnEdges && !n.loop) {
        if (i.isVertical()) {
            if (f < r.startY && i.translate <= i.maxTranslate() || f > r.startY && i.translate >= i.minTranslate()) {
                s.isTouched = !1, s.isMoved = !1;
                return
            }
        } else if (c < r.startX && i.translate <= i.maxTranslate() || c > r.startX && i.translate >= i.minTranslate()) return
    }
    if (e.activeElement && a.target === e.activeElement && a.target.matches(s.focusableElements)) {
        s.isMoved = !0, i.allowClick = !1;
        return
    }
    s.allowTouchCallbacks && i.emit("touchMove", a), r.previousX = r.currentX, r.previousY = r.currentY, r.currentX = c, r.currentY = f;
    const u = r.currentX - r.startX,
        p = r.currentY - r.startY;
    if (i.params.threshold && Math.sqrt(u ** 2 + p ** 2) < i.params.threshold) return;
    if (typeof s.isScrolling > "u") {
        let L;
        i.isHorizontal() && r.currentY === r.startY || i.isVertical() && r.currentX === r.startX ? s.isScrolling = !1 : u * u + p * p >= 25 && (L = Math.atan2(Math.abs(p), Math.abs(u)) * 180 / Math.PI, s.isScrolling = i.isHorizontal() ? L > n.touchAngle : 90 - L > n.touchAngle)
    }
    if (s.isScrolling && i.emit("touchMoveOpposite", a), typeof s.startMoving > "u" && (r.currentX !== r.startX || r.currentY !== r.startY) && (s.startMoving = !0), s.isScrolling) {
        s.isTouched = !1;
        return
    }
    if (!s.startMoving) return;
    i.allowClick = !1, !n.cssMode && a.cancelable && a.preventDefault(), n.touchMoveStopPropagation && !n.nested && a.stopPropagation();
    let h = i.isHorizontal() ? u : p,
        g = i.isHorizontal() ? r.currentX - r.previousX : r.currentY - r.previousY;
    n.oneWayMovement && (h = Math.abs(h) * (l ? 1 : -1), g = Math.abs(g) * (l ? 1 : -1)), r.diff = h, h *= n.touchRatio, l && (h = -h, g = -g);
    const y = i.touchesDirection;
    i.swipeDirection = h > 0 ? "prev" : "next", i.touchesDirection = g > 0 ? "prev" : "next";
    const v = i.params.loop && !n.cssMode,
        M = i.touchesDirection === "next" && i.allowSlideNext || i.touchesDirection === "prev" && i.allowSlidePrev;
    if (!s.isMoved) {
        if (v && M && i.loopFix({
                direction: i.swipeDirection
            }), s.startTranslate = i.getTranslate(), i.setTransition(0), i.animating) {
            const L = new window.CustomEvent("transitionend", {
                bubbles: !0,
                cancelable: !0
            });
            i.wrapperEl.dispatchEvent(L)
        }
        s.allowMomentumBounce = !1, n.grabCursor && (i.allowSlideNext === !0 || i.allowSlidePrev === !0) && i.setGrabCursor(!0), i.emit("sliderFirstMove", a)
    }
    let w;
    if (new Date().getTime(), s.isMoved && s.allowThresholdMove && y !== i.touchesDirection && v && M && Math.abs(h) >= 1) {
        Object.assign(r, {
            startX: c,
            startY: f,
            currentX: c,
            currentY: f,
            startTranslate: s.currentTranslate
        }), s.loopSwapReset = !0, s.startTranslate = s.currentTranslate;
        return
    }
    i.emit("sliderMove", a), s.isMoved = !0, s.currentTranslate = h + s.startTranslate;
    let T = !0,
        b = n.resistanceRatio;
    if (n.touchReleaseOnEdges && (b = 0), h > 0 ? (v && M && !w && s.allowThresholdMove && s.currentTranslate > (n.centeredSlides ? i.minTranslate() - i.slidesSizesGrid[i.activeIndex + 1] : i.minTranslate()) && i.loopFix({
            direction: "prev",
            setTranslate: !0,
            activeSlideIndex: 0
        }), s.currentTranslate > i.minTranslate() && (T = !1, n.resistance && (s.currentTranslate = i.minTranslate() - 1 + (-i.minTranslate() + s.startTranslate + h) ** b))) : h < 0 && (v && M && !w && s.allowThresholdMove && s.currentTranslate < (n.centeredSlides ? i.maxTranslate() + i.slidesSizesGrid[i.slidesSizesGrid.length - 1] : i.maxTranslate()) && i.loopFix({
            direction: "next",
            setTranslate: !0,
            activeSlideIndex: i.slides.length - (n.slidesPerView === "auto" ? i.slidesPerViewDynamic() : Math.ceil(parseFloat(n.slidesPerView, 10)))
        }), s.currentTranslate < i.maxTranslate() && (T = !1, n.resistance && (s.currentTranslate = i.maxTranslate() + 1 - (i.maxTranslate() - s.startTranslate - h) ** b))), T && (a.preventedByNestedSwiper = !0), !i.allowSlideNext && i.swipeDirection === "next" && s.currentTranslate < s.startTranslate && (s.currentTranslate = s.startTranslate), !i.allowSlidePrev && i.swipeDirection === "prev" && s.currentTranslate > s.startTranslate && (s.currentTranslate = s.startTranslate), !i.allowSlidePrev && !i.allowSlideNext && (s.currentTranslate = s.startTranslate), n.threshold > 0)
        if (Math.abs(h) > n.threshold || s.allowThresholdMove) {
            if (!s.allowThresholdMove) {
                s.allowThresholdMove = !0, r.startX = r.currentX, r.startY = r.currentY, s.currentTranslate = s.startTranslate, r.diff = i.isHorizontal() ? r.currentX - r.startX : r.currentY - r.startY;
                return
            }
        } else {
            s.currentTranslate = s.startTranslate;
            return
        }!n.followFinger || n.cssMode || ((n.freeMode && n.freeMode.enabled && i.freeMode || n.watchSlidesProgress) && (i.updateActiveIndex(), i.updateSlidesClasses()), n.freeMode && n.freeMode.enabled && i.freeMode && i.freeMode.onTouchMove(), i.updateProgress(s.currentTranslate), i.setTranslate(s.currentTranslate))
}

function yt(t) {
    const e = this,
        i = e.touchEventsData;
    let s = t;
    s.originalEvent && (s = s.originalEvent);
    let n;
    if (s.type === "touchend" || s.type === "touchcancel") {
        if (n = [...s.changedTouches].filter(b => b.identifier === i.touchId)[0], !n || n.identifier !== i.touchId) return
    } else {
        if (i.touchId !== null || s.pointerId !== i.pointerId) return;
        n = s
    }
    if (["pointercancel", "pointerout", "pointerleave", "contextmenu"].includes(s.type) && !(["pointercancel", "contextmenu"].includes(s.type) && (e.browser.isSafari || e.browser.isWebView))) return;
    i.pointerId = null, i.touchId = null;
    const {
        params: l,
        touches: o,
        rtlTranslate: a,
        slidesGrid: d,
        enabled: c
    } = e;
    if (!c || !l.simulateTouch && s.pointerType === "mouse") return;
    if (i.allowTouchCallbacks && e.emit("touchEnd", s), i.allowTouchCallbacks = !1, !i.isTouched) {
        i.isMoved && l.grabCursor && e.setGrabCursor(!1), i.isMoved = !1, i.startMoving = !1;
        return
    }
    l.grabCursor && i.isMoved && i.isTouched && (e.allowSlideNext === !0 || e.allowSlidePrev === !0) && e.setGrabCursor(!1);
    const f = K(),
        u = f - i.touchStartTime;
    if (e.allowClick) {
        const b = s.path || s.composedPath && s.composedPath();
        e.updateClickedSlide(b && b[0] || s.target, b), e.emit("tap click", s), u < 300 && f - i.lastClickTime < 300 && e.emit("doubleTap doubleClick", s)
    }
    if (i.lastClickTime = K(), re(() => {
            e.destroyed || (e.allowClick = !0)
        }), !i.isTouched || !i.isMoved || !e.swipeDirection || o.diff === 0 && !i.loopSwapReset || i.currentTranslate === i.startTranslate && !i.loopSwapReset) {
        i.isTouched = !1, i.isMoved = !1, i.startMoving = !1;
        return
    }
    i.isTouched = !1, i.isMoved = !1, i.startMoving = !1;
    let p;
    if (l.followFinger ? p = a ? e.translate : -e.translate : p = -i.currentTranslate, l.cssMode) return;
    if (l.freeMode && l.freeMode.enabled) {
        e.freeMode.onTouchEnd({
            currentPos: p
        });
        return
    }
    const h = p >= -e.maxTranslate() && !e.params.loop;
    let g = 0,
        y = e.slidesSizesGrid[0];
    for (let b = 0; b < d.length; b += b < l.slidesPerGroupSkip ? 1 : l.slidesPerGroup) {
        const L = b < l.slidesPerGroupSkip - 1 ? 1 : l.slidesPerGroup;
        typeof d[b + L] < "u" ? (h || p >= d[b] && p < d[b + L]) && (g = b, y = d[b + L] - d[b]) : (h || p >= d[b]) && (g = b, y = d[d.length - 1] - d[d.length - 2])
    }
    let v = null,
        M = null;
    l.rewind && (e.isBeginning ? M = l.virtual && l.virtual.enabled && e.virtual ? e.virtual.slides.length - 1 : e.slides.length - 1 : e.isEnd && (v = 0));
    const w = (p - d[g]) / y,
        T = g < l.slidesPerGroupSkip - 1 ? 1 : l.slidesPerGroup;
    if (u > l.longSwipesMs) {
        if (!l.longSwipes) {
            e.slideTo(e.activeIndex);
            return
        }
        e.swipeDirection === "next" && (w >= l.longSwipesRatio ? e.slideTo(l.rewind && e.isEnd ? v : g + T) : e.slideTo(g)), e.swipeDirection === "prev" && (w > 1 - l.longSwipesRatio ? e.slideTo(g + T) : M !== null && w < 0 && Math.abs(w) > l.longSwipesRatio ? e.slideTo(M) : e.slideTo(g))
    } else {
        if (!l.shortSwipes) {
            e.slideTo(e.activeIndex);
            return
        }
        e.navigation && (s.target === e.navigation.nextEl || s.target === e.navigation.prevEl) ? s.target === e.navigation.nextEl ? e.slideTo(g + T) : e.slideTo(g) : (e.swipeDirection === "next" && e.slideTo(v !== null ? v : g + T), e.swipeDirection === "prev" && e.slideTo(M !== null ? M : g))
    }
}

function ue() {
    const t = this,
        {
            params: e,
            el: i
        } = t;
    if (i && i.offsetWidth === 0) return;
    e.breakpoints && t.setBreakpoint();
    const {
        allowSlideNext: s,
        allowSlidePrev: n,
        snapGrid: r
    } = t, l = t.virtual && t.params.virtual.enabled;
    t.allowSlideNext = !0, t.allowSlidePrev = !0, t.updateSize(), t.updateSlides(), t.updateSlidesClasses();
    const o = l && e.loop;
    (e.slidesPerView === "auto" || e.slidesPerView > 1) && t.isEnd && !t.isBeginning && !t.params.centeredSlides && !o ? t.slideTo(t.slides.length - 1, 0, !1, !0) : t.params.loop && !l ? t.slideToLoop(t.realIndex, 0, !1, !0) : t.slideTo(t.activeIndex, 0, !1, !0), t.autoplay && t.autoplay.running && t.autoplay.paused && (clearTimeout(t.autoplay.resizeTimeout), t.autoplay.resizeTimeout = setTimeout(() => {
        t.autoplay && t.autoplay.running && t.autoplay.paused && t.autoplay.resume()
    }, 500)), t.allowSlidePrev = n, t.allowSlideNext = s, t.params.watchOverflow && r !== t.snapGrid && t.checkOverflow()
}

function bt(t) {
    const e = this;
    e.enabled && (e.allowClick || (e.params.preventClicks && t.preventDefault(), e.params.preventClicksPropagation && e.animating && (t.stopPropagation(), t.stopImmediatePropagation())))
}

function Et() {
    const t = this,
        {
            wrapperEl: e,
            rtlTranslate: i,
            enabled: s
        } = t;
    if (!s) return;
    t.previousTranslate = t.translate, t.isHorizontal() ? t.translate = -e.scrollLeft : t.translate = -e.scrollTop, t.translate === 0 && (t.translate = 0), t.updateActiveIndex(), t.updateSlidesClasses();
    let n;
    const r = t.maxTranslate() - t.minTranslate();
    r === 0 ? n = 0 : n = (t.translate - t.minTranslate()) / r, n !== t.progress && t.updateProgress(i ? -t.translate : t.translate), t.emit("setTranslate", t.translate, !1)
}

function Mt(t) {
    const e = this;
    X(e, t.target), !(e.params.cssMode || e.params.slidesPerView !== "auto" && !e.params.autoHeight) && e.update()
}

function Pt() {
    const t = this;
    t.documentTouchHandlerProceeded || (t.documentTouchHandlerProceeded = !0, t.params.touchReleaseOnEdges && (t.el.style.touchAction = "auto"))
}
const Se = (t, e) => {
    const i = $(),
        {
            params: s,
            el: n,
            wrapperEl: r,
            device: l
        } = t,
        o = !!s.nested,
        a = e === "on" ? "addEventListener" : "removeEventListener",
        d = e;
    i[a]("touchstart", t.onDocumentTouchStart, {
        passive: !1,
        capture: o
    }), n[a]("touchstart", t.onTouchStart, {
        passive: !1
    }), n[a]("pointerdown", t.onTouchStart, {
        passive: !1
    }), i[a]("touchmove", t.onTouchMove, {
        passive: !1,
        capture: o
    }), i[a]("pointermove", t.onTouchMove, {
        passive: !1,
        capture: o
    }), i[a]("touchend", t.onTouchEnd, {
        passive: !0
    }), i[a]("pointerup", t.onTouchEnd, {
        passive: !0
    }), i[a]("pointercancel", t.onTouchEnd, {
        passive: !0
    }), i[a]("touchcancel", t.onTouchEnd, {
        passive: !0
    }), i[a]("pointerout", t.onTouchEnd, {
        passive: !0
    }), i[a]("pointerleave", t.onTouchEnd, {
        passive: !0
    }), i[a]("contextmenu", t.onTouchEnd, {
        passive: !0
    }), (s.preventClicks || s.preventClicksPropagation) && n[a]("click", t.onClick, !0), s.cssMode && r[a]("scroll", t.onScroll), s.updateOnWindowResize ? t[d](l.ios || l.android ? "resize orientationchange observerUpdate" : "resize observerUpdate", ue, !0) : t[d]("observerUpdate", ue, !0), n[a]("load", t.onLoad, {
        capture: !0
    })
};

function It() {
    const t = this,
        {
            params: e
        } = t;
    t.onTouchStart = Tt.bind(t), t.onTouchMove = xt.bind(t), t.onTouchEnd = yt.bind(t), t.onDocumentTouchStart = Pt.bind(t), e.cssMode && (t.onScroll = Et.bind(t)), t.onClick = bt.bind(t), t.onLoad = Mt.bind(t), Se(t, "on")
}

function Ct() {
    Se(this, "off")
}
var Lt = {
    attachEvents: It,
    detachEvents: Ct
};
const pe = (t, e) => t.grid && e.grid && e.grid.rows > 1;

function Ot() {
    const t = this,
        {
            realIndex: e,
            initialized: i,
            params: s,
            el: n
        } = t,
        r = s.breakpoints;
    if (!r || r && Object.keys(r).length === 0) return;
    const l = t.getBreakpoint(r, t.params.breakpointsBase, t.el);
    if (!l || t.currentBreakpoint === l) return;
    const a = (l in r ? r[l] : void 0) || t.originalParams,
        d = pe(t, s),
        c = pe(t, a),
        f = s.enabled;
    d && !c ? (n.classList.remove(`${s.containerModifierClass}grid`, `${s.containerModifierClass}grid-column`), t.emitContainerClasses()) : !d && c && (n.classList.add(`${s.containerModifierClass}grid`), (a.grid.fill && a.grid.fill === "column" || !a.grid.fill && s.grid.fill === "column") && n.classList.add(`${s.containerModifierClass}grid-column`), t.emitContainerClasses()), ["navigation", "pagination", "scrollbar"].forEach(v => {
        if (typeof a[v] > "u") return;
        const M = s[v] && s[v].enabled,
            w = a[v] && a[v].enabled;
        M && !w && t[v].disable(), !M && w && t[v].enable()
    });
    const u = a.direction && a.direction !== s.direction,
        p = s.loop && (a.slidesPerView !== s.slidesPerView || u),
        h = s.loop;
    u && i && t.changeDirection(), k(t.params, a);
    const g = t.params.enabled,
        y = t.params.loop;
    Object.assign(t, {
        allowTouchMove: t.params.allowTouchMove,
        allowSlideNext: t.params.allowSlideNext,
        allowSlidePrev: t.params.allowSlidePrev
    }), f && !g ? t.disable() : !f && g && t.enable(), t.currentBreakpoint = l, t.emit("_beforeBreakpoint", a), i && (p ? (t.loopDestroy(), t.loopCreate(e), t.updateSlides()) : !h && y ? (t.loopCreate(e), t.updateSlides()) : h && !y && t.loopDestroy()), t.emit("breakpoint", a)
}

function zt(t, e, i) {
    if (e === void 0 && (e = "window"), !t || e === "container" && !i) return;
    let s = !1;
    const n = D(),
        r = e === "window" ? n.innerHeight : i.clientHeight,
        l = Object.keys(t).map(o => {
            if (typeof o == "string" && o.indexOf("@") === 0) {
                const a = parseFloat(o.substr(1));
                return {
                    value: r * a,
                    point: o
                }
            }
            return {
                value: o,
                point: o
            }
        });
    l.sort((o, a) => parseInt(o.value, 10) - parseInt(a.value, 10));
    for (let o = 0; o < l.length; o += 1) {
        const {
            point: a,
            value: d
        } = l[o];
        e === "window" ? n.matchMedia(`(min-width: ${d}px)`).matches && (s = a) : d <= i.clientWidth && (s = a)
    }
    return s || "max"
}
var At = {
    setBreakpoint: Ot,
    getBreakpoint: zt
};

function Gt(t, e) {
    const i = [];
    return t.forEach(s => {
        typeof s == "object" ? Object.keys(s).forEach(n => {
            s[n] && i.push(e + n)
        }) : typeof s == "string" && i.push(e + s)
    }), i
}

function Vt() {
    const t = this,
        {
            classNames: e,
            params: i,
            rtl: s,
            el: n,
            device: r
        } = t,
        l = Gt(["initialized", i.direction, {
            "free-mode": t.params.freeMode && i.freeMode.enabled
        }, {
            autoheight: i.autoHeight
        }, {
            rtl: s
        }, {
            grid: i.grid && i.grid.rows > 1
        }, {
            "grid-column": i.grid && i.grid.rows > 1 && i.grid.fill === "column"
        }, {
            android: r.android
        }, {
            ios: r.ios
        }, {
            "css-mode": i.cssMode
        }, {
            centered: i.cssMode && i.centeredSlides
        }, {
            "watch-progress": i.watchSlidesProgress
        }], i.containerModifierClass);
    e.push(...l), n.classList.add(...e), t.emitContainerClasses()
}

function kt() {
    const t = this,
        {
            el: e,
            classNames: i
        } = t;
    e.classList.remove(...i), t.emitContainerClasses()
}
var Dt = {
    addClasses: Vt,
    removeClasses: kt
};

function Ft() {
    const t = this,
        {
            isLocked: e,
            params: i
        } = t,
        {
            slidesOffsetBefore: s
        } = i;
    if (s) {
        const n = t.slides.length - 1,
            r = t.slidesGrid[n] + t.slidesSizesGrid[n] + s * 2;
        t.isLocked = t.size > r
    } else t.isLocked = t.snapGrid.length === 1;
    i.allowSlideNext === !0 && (t.allowSlideNext = !t.isLocked), i.allowSlidePrev === !0 && (t.allowSlidePrev = !t.isLocked), e && e !== t.isLocked && (t.isEnd = !1), e !== t.isLocked && t.emit(t.isLocked ? "lock" : "unlock")
}
var _t = {
        checkOverflow: Ft
    },
    me = {
        init: !0,
        direction: "horizontal",
        oneWayMovement: !1,
        touchEventsTarget: "wrapper",
        initialSlide: 0,
        speed: 300,
        cssMode: !1,
        updateOnWindowResize: !0,
        resizeObserver: !0,
        nested: !1,
        createElements: !1,
        eventsPrefix: "swiper",
        enabled: !0,
        focusableElements: "input, select, option, textarea, button, video, label",
        width: null,
        height: null,
        preventInteractionOnTransition: !1,
        userAgent: null,
        url: null,
        edgeSwipeDetection: !1,
        edgeSwipeThreshold: 20,
        autoHeight: !1,
        setWrapperSize: !1,
        virtualTranslate: !1,
        effect: "slide",
        breakpoints: void 0,
        breakpointsBase: "window",
        spaceBetween: 0,
        slidesPerView: 1,
        slidesPerGroup: 1,
        slidesPerGroupSkip: 0,
        slidesPerGroupAuto: !1,
        centeredSlides: !1,
        centeredSlidesBounds: !1,
        slidesOffsetBefore: 0,
        slidesOffsetAfter: 0,
        normalizeSlideIndex: !0,
        centerInsufficientSlides: !1,
        watchOverflow: !0,
        roundLengths: !1,
        touchRatio: 1,
        touchAngle: 45,
        simulateTouch: !0,
        shortSwipes: !0,
        longSwipes: !0,
        longSwipesRatio: .5,
        longSwipesMs: 300,
        followFinger: !0,
        allowTouchMove: !0,
        threshold: 5,
        touchMoveStopPropagation: !1,
        touchStartPreventDefault: !0,
        touchStartForcePreventDefault: !1,
        touchReleaseOnEdges: !1,
        uniqueNavElements: !0,
        resistance: !0,
        resistanceRatio: .85,
        watchSlidesProgress: !1,
        grabCursor: !1,
        preventClicks: !0,
        preventClicksPropagation: !0,
        slideToClickedSlide: !1,
        loop: !1,
        loopAddBlankSlides: !0,
        loopAdditionalSlides: 0,
        loopPreventsSliding: !0,
        rewind: !1,
        allowSlidePrev: !0,
        allowSlideNext: !0,
        swipeHandler: null,
        noSwiping: !0,
        noSwipingClass: "swiper-no-swiping",
        noSwipingSelector: null,
        passiveListeners: !0,
        maxBackfaceHiddenSlides: 10,
        containerModifierClass: "swiper-",
        slideClass: "swiper-slide",
        slideBlankClass: "swiper-slide-blank",
        slideActiveClass: "swiper-slide-active",
        slideVisibleClass: "swiper-slide-visible",
        slideFullyVisibleClass: "swiper-slide-fully-visible",
        slideNextClass: "swiper-slide-next",
        slidePrevClass: "swiper-slide-prev",
        wrapperClass: "swiper-wrapper",
        lazyPreloaderClass: "swiper-lazy-preloader",
        lazyPreloadPrevNext: 0,
        runCallbacksOnInit: !0,
        _emitClasses: !1
    };

function Nt(t, e) {
    return function(s) {
        s === void 0 && (s = {});
        const n = Object.keys(s)[0],
            r = s[n];
        if (typeof r != "object" || r === null) {
            k(e, s);
            return
        }
        if (t[n] === !0 && (t[n] = {
                enabled: !0
            }), n === "navigation" && t[n] && t[n].enabled && !t[n].prevEl && !t[n].nextEl && (t[n].auto = !0), ["pagination", "scrollbar"].indexOf(n) >= 0 && t[n] && t[n].enabled && !t[n].el && (t[n].auto = !0), !(n in t && "enabled" in r)) {
            k(e, s);
            return
        }
        typeof t[n] == "object" && !("enabled" in t[n]) && (t[n].enabled = !0), t[n] || (t[n] = {
            enabled: !1
        }), k(e, s)
    }
}
const ie = {
        eventsEmitter: De,
        update: Ye,
        translate: Ze,
        transition: st,
        slide: ft,
        loop: ht,
        grabCursor: wt,
        events: Lt,
        breakpoints: At,
        checkOverflow: _t,
        classes: Dt
    },
    se = {};
class F {
    constructor() {
        let e, i;
        for (var s = arguments.length, n = new Array(s), r = 0; r < s; r++) n[r] = arguments[r];
        n.length === 1 && n[0].constructor && Object.prototype.toString.call(n[0]).slice(8, -1) === "Object" ? i = n[0] : [e, i] = n, i || (i = {}), i = k({}, i), e && !i.el && (i.el = e);
        const l = $();
        if (i.el && typeof i.el == "string" && l.querySelectorAll(i.el).length > 1) {
            const c = [];
            return l.querySelectorAll(i.el).forEach(f => {
                const u = k({}, i, {
                    el: f
                });
                c.push(new F(u))
            }), c
        }
        const o = this;
        o.__swiper__ = !0, o.support = ve(), o.device = ze({
            userAgent: i.userAgent
        }), o.browser = Ge(), o.eventsListeners = {}, o.eventsAnyListeners = [], o.modules = [...o.__modules__], i.modules && Array.isArray(i.modules) && o.modules.push(...i.modules);
        const a = {};
        o.modules.forEach(c => {
            c({
                params: i,
                swiper: o,
                extendParams: Nt(i, a),
                on: o.on.bind(o),
                once: o.once.bind(o),
                off: o.off.bind(o),
                emit: o.emit.bind(o)
            })
        });
        const d = k({}, me, a);
        return o.params = k({}, d, se, i), o.originalParams = k({}, o.params), o.passedParams = k({}, i), o.params && o.params.on && Object.keys(o.params.on).forEach(c => {
            o.on(c, o.params.on[c])
        }), o.params && o.params.onAny && o.onAny(o.params.onAny), Object.assign(o, {
            enabled: o.params.enabled,
            el: e,
            classNames: [],
            slides: [],
            slidesGrid: [],
            snapGrid: [],
            slidesSizesGrid: [],
            isHorizontal() {
                return o.params.direction === "horizontal"
            },
            isVertical() {
                return o.params.direction === "vertical"
            },
            activeIndex: 0,
            realIndex: 0,
            isBeginning: !0,
            isEnd: !1,
            translate: 0,
            previousTranslate: 0,
            progress: 0,
            velocity: 0,
            animating: !1,
            cssOverflowAdjustment() {
                return Math.trunc(this.translate / 2 ** 23) * 2 ** 23
            },
            allowSlideNext: o.params.allowSlideNext,
            allowSlidePrev: o.params.allowSlidePrev,
            touchEventsData: {
                isTouched: void 0,
                isMoved: void 0,
                allowTouchCallbacks: void 0,
                touchStartTime: void 0,
                isScrolling: void 0,
                currentTranslate: void 0,
                startTranslate: void 0,
                allowThresholdMove: void 0,
                focusableElements: o.params.focusableElements,
                lastClickTime: 0,
                clickTimeout: void 0,
                velocities: [],
                allowMomentumBounce: void 0,
                startMoving: void 0,
                pointerId: null,
                touchId: null
            },
            allowClick: !0,
            allowTouchMove: o.params.allowTouchMove,
            touches: {
                startX: 0,
                startY: 0,
                currentX: 0,
                currentY: 0,
                diff: 0
            },
            imagesToLoad: [],
            imagesLoaded: 0
        }), o.emit("_swiper"), o.params.init && o.init(), o
    }
    getDirectionLabel(e) {
        return this.isHorizontal() ? e : {
            width: "height",
            "margin-top": "margin-left",
            "margin-bottom ": "margin-right",
            "margin-left": "margin-top",
            "margin-right": "margin-bottom",
            "padding-left": "padding-top",
            "padding-right": "padding-bottom",
            marginRight: "marginBottom"
        }[e]
    }
    getSlideIndex(e) {
        const {
            slidesEl: i,
            params: s
        } = this, n = _(i, `.${s.slideClass}, swiper-slide`), r = de(n[0]);
        return de(e) - r
    }
    getSlideIndexByData(e) {
        return this.getSlideIndex(this.slides.filter(i => i.getAttribute("data-swiper-slide-index") * 1 === e)[0])
    }
    recalcSlides() {
        const e = this,
            {
                slidesEl: i,
                params: s
            } = e;
        e.slides = _(i, `.${s.slideClass}, swiper-slide`)
    }
    enable() {
        const e = this;
        e.enabled || (e.enabled = !0, e.params.grabCursor && e.setGrabCursor(), e.emit("enable"))
    }
    disable() {
        const e = this;
        e.enabled && (e.enabled = !1, e.params.grabCursor && e.unsetGrabCursor(), e.emit("disable"))
    }
    setProgress(e, i) {
        const s = this;
        e = Math.min(Math.max(e, 0), 1);
        const n = s.minTranslate(),
            l = (s.maxTranslate() - n) * e + n;
        s.translateTo(l, typeof i > "u" ? 0 : i), s.updateActiveIndex(), s.updateSlidesClasses()
    }
    emitContainerClasses() {
        const e = this;
        if (!e.params._emitClasses || !e.el) return;
        const i = e.el.className.split(" ").filter(s => s.indexOf("swiper") === 0 || s.indexOf(e.params.containerModifierClass) === 0);
        e.emit("_containerClasses", i.join(" "))
    }
    getSlideClasses(e) {
        const i = this;
        return i.destroyed ? "" : e.className.split(" ").filter(s => s.indexOf("swiper-slide") === 0 || s.indexOf(i.params.slideClass) === 0).join(" ")
    }
    emitSlidesClasses() {
        const e = this;
        if (!e.params._emitClasses || !e.el) return;
        const i = [];
        e.slides.forEach(s => {
            const n = e.getSlideClasses(s);
            i.push({
                slideEl: s,
                classNames: n
            }), e.emit("_slideClass", s, n)
        }), e.emit("_slideClasses", i)
    }
    slidesPerViewDynamic(e, i) {
        e === void 0 && (e = "current"), i === void 0 && (i = !1);
        const s = this,
            {
                params: n,
                slides: r,
                slidesGrid: l,
                slidesSizesGrid: o,
                size: a,
                activeIndex: d
            } = s;
        let c = 1;
        if (typeof n.slidesPerView == "number") return n.slidesPerView;
        if (n.centeredSlides) {
            let f = r[d] ? r[d].swiperSlideSize : 0,
                u;
            for (let p = d + 1; p < r.length; p += 1) r[p] && !u && (f += r[p].swiperSlideSize, c += 1, f > a && (u = !0));
            for (let p = d - 1; p >= 0; p -= 1) r[p] && !u && (f += r[p].swiperSlideSize, c += 1, f > a && (u = !0))
        } else if (e === "current")
            for (let f = d + 1; f < r.length; f += 1)(i ? l[f] + o[f] - l[d] < a : l[f] - l[d] < a) && (c += 1);
        else
            for (let f = d - 1; f >= 0; f -= 1) l[d] - l[f] < a && (c += 1);
        return c
    }
    update() {
        const e = this;
        if (!e || e.destroyed) return;
        const {
            snapGrid: i,
            params: s
        } = e;
        s.breakpoints && e.setBreakpoint(), [...e.el.querySelectorAll('[loading="lazy"]')].forEach(l => {
            l.complete && X(e, l)
        }), e.updateSize(), e.updateSlides(), e.updateProgress(), e.updateSlidesClasses();

        function n() {
            const l = e.rtlTranslate ? e.translate * -1 : e.translate,
                o = Math.min(Math.max(l, e.maxTranslate()), e.minTranslate());
            e.setTranslate(o), e.updateActiveIndex(), e.updateSlidesClasses()
        }
        let r;
        if (s.freeMode && s.freeMode.enabled && !s.cssMode) n(), s.autoHeight && e.updateAutoHeight();
        else {
            if ((s.slidesPerView === "auto" || s.slidesPerView > 1) && e.isEnd && !s.centeredSlides) {
                const l = e.virtual && s.virtual.enabled ? e.virtual.slides : e.slides;
                r = e.slideTo(l.length - 1, 0, !1, !0)
            } else r = e.slideTo(e.activeIndex, 0, !1, !0);
            r || n()
        }
        s.watchOverflow && i !== e.snapGrid && e.checkOverflow(), e.emit("update")
    }
    changeDirection(e, i) {
        i === void 0 && (i = !0);
        const s = this,
            n = s.params.direction;
        return e || (e = n === "horizontal" ? "vertical" : "horizontal"), e === n || e !== "horizontal" && e !== "vertical" || (s.el.classList.remove(`${s.params.containerModifierClass}${n}`), s.el.classList.add(`${s.params.containerModifierClass}${e}`), s.emitContainerClasses(), s.params.direction = e, s.slides.forEach(r => {
            e === "vertical" ? r.style.width = "" : r.style.height = ""
        }), s.emit("changeDirection"), i && s.update()), s
    }
    changeLanguageDirection(e) {
        const i = this;
        i.rtl && e === "rtl" || !i.rtl && e === "ltr" || (i.rtl = e === "rtl", i.rtlTranslate = i.params.direction === "horizontal" && i.rtl, i.rtl ? (i.el.classList.add(`${i.params.containerModifierClass}rtl`), i.el.dir = "rtl") : (i.el.classList.remove(`${i.params.containerModifierClass}rtl`), i.el.dir = "ltr"), i.update())
    }
    mount(e) {
        const i = this;
        if (i.mounted) return !0;
        let s = e || i.params.el;
        if (typeof s == "string" && (s = document.querySelector(s)), !s) return !1;
        s.swiper = i, s.parentNode && s.parentNode.host && s.parentNode.host.nodeName === "SWIPER-CONTAINER" && (i.isElement = !0);
        const n = () => `.${(i.params.wrapperClass||"").trim().split(" ").join(".")}`;
        let l = s && s.shadowRoot && s.shadowRoot.querySelector ? s.shadowRoot.querySelector(n()) : _(s, n())[0];
        return !l && i.params.createElements && (l = ne("div", i.params.wrapperClass), s.append(l), _(s, `.${i.params.slideClass}`).forEach(o => {
            l.append(o)
        })), Object.assign(i, {
            el: s,
            wrapperEl: l,
            slidesEl: i.isElement && !s.parentNode.host.slideSlots ? s.parentNode.host : l,
            hostEl: i.isElement ? s.parentNode.host : s,
            mounted: !0,
            rtl: s.dir.toLowerCase() === "rtl" || N(s, "direction") === "rtl",
            rtlTranslate: i.params.direction === "horizontal" && (s.dir.toLowerCase() === "rtl" || N(s, "direction") === "rtl"),
            wrongRTL: N(l, "display") === "-webkit-box"
        }), !0
    }
    init(e) {
        const i = this;
        if (i.initialized || i.mount(e) === !1) return i;
        i.emit("beforeInit"), i.params.breakpoints && i.setBreakpoint(), i.addClasses(), i.updateSize(), i.updateSlides(), i.params.watchOverflow && i.checkOverflow(), i.params.grabCursor && i.enabled && i.setGrabCursor(), i.params.loop && i.virtual && i.params.virtual.enabled ? i.slideTo(i.params.initialSlide + i.virtual.slidesBefore, 0, i.params.runCallbacksOnInit, !1, !0) : i.slideTo(i.params.initialSlide, 0, i.params.runCallbacksOnInit, !1, !0), i.params.loop && i.loopCreate(), i.attachEvents();
        const n = [...i.el.querySelectorAll('[loading="lazy"]')];
        return i.isElement && n.push(...i.hostEl.querySelectorAll('[loading="lazy"]')), n.forEach(r => {
            r.complete ? X(i, r) : r.addEventListener("load", l => {
                X(i, l.target)
            })
        }), ae(i), i.initialized = !0, ae(i), i.emit("init"), i.emit("afterInit"), i
    }
    destroy(e, i) {
        e === void 0 && (e = !0), i === void 0 && (i = !0);
        const s = this,
            {
                params: n,
                el: r,
                wrapperEl: l,
                slides: o
            } = s;
        return typeof s.params > "u" || s.destroyed || (s.emit("beforeDestroy"), s.initialized = !1, s.detachEvents(), n.loop && s.loopDestroy(), i && (s.removeClasses(), r.removeAttribute("style"), l.removeAttribute("style"), o && o.length && o.forEach(a => {
            a.classList.remove(n.slideVisibleClass, n.slideFullyVisibleClass, n.slideActiveClass, n.slideNextClass, n.slidePrevClass), a.removeAttribute("style"), a.removeAttribute("data-swiper-slide-index")
        })), s.emit("destroy"), Object.keys(s.eventsListeners).forEach(a => {
            s.off(a)
        }), e !== !1 && (s.el.swiper = null, ye(s)), s.destroyed = !0), null
    }
    static extendDefaults(e) {
        k(se, e)
    }
    static get extendedDefaults() {
        return se
    }
    static get defaults() {
        return me
    }
    static installModule(e) {
        F.prototype.__modules__ || (F.prototype.__modules__ = []);
        const i = F.prototype.__modules__;
        typeof e == "function" && i.indexOf(e) < 0 && i.push(e)
    }
    static use(e) {
        return Array.isArray(e) ? (e.forEach(i => F.installModule(i)), F) : (F.installModule(e), F)
    }
}
Object.keys(ie).forEach(t => {
    Object.keys(ie[t]).forEach(e => {
        F.prototype[e] = ie[t][e]
    })
});
F.use([Ve, ke]);
typeof window < "u" && window.SwiperElementRegisterParams && window.SwiperElementRegisterParams(["materialEffect"]);

function Bt(t, e) {
    function i(s) {
        s.target === t && (e.call(t, s), t.removeEventListener("transitionend", i))
    }
    e && t.addEventListener("transitionend", i)
}

function Rt({
    swiper: t,
    duration: e,
    transformElements: i,
    allSlides: s
}) {
    const {
        activeIndex: n
    } = t, r = l => l.parentElement ? l.parentElement : t.slides.filter(a => a.shadowRoot && a.shadowRoot === l.parentNode)[0];
    if (t.params.virtualTranslate && e !== 0) {
        let l = !1,
            o;
        s ? o = i : o = i.filter(a => {
            const d = a.classList.contains("swiper-slide-transform") ? r(a) : a;
            return t.getSlideIndex(d) === n
        }), o.forEach(a => {
            Bt(a, () => {
                if (l || !t || t.destroyed) return;
                l = !0, t.animating = !1;
                const d = new window.CustomEvent("transitionend", {
                    bubbles: !0,
                    cancelable: !0
                });
                t.wrapperEl.dispatchEvent(d)
            })
        })
    }
}

function $t({
    swiper: t,
    on: e,
    extendParams: i
}) {
    i({
        materialEffect: {
            slideSplitRatio: .65
        }
    });
    const s = () => {
            const {
                slides: r,
                slidesSizesGrid: l,
                params: o,
                size: a
            } = t, {
                slidesPerView: d,
                spaceBetween: c,
                cssMode: f,
                centeredSlides: u
            } = o, {
                slideSplitRatio: p
            } = o.materialEffect, h = u && parseInt(d, 10) !== d, g = u ? h ? (d - Math.floor(d)) / 2 : .5 : Math.min(Math.max(p, 0), 1), y = u ? h ? (d - Math.floor(d)) / 2 : .5 : 1 - Math.min(Math.max(p, 0), 1), v = h ? .5 + (.5 - y) : y;
            for (let M = 0; M < r.length; M += 1) {
                const w = r[M],
                    T = w.querySelector(".swiper-material-wrapper"),
                    b = w.querySelectorAll(".swiper-material-animate-opacity"),
                    L = w.querySelectorAll("[data-swiper-material-scale]"),
                    P = -w.progress,
                    O = w.swiperSlideOffset,
                    V = t.translate;
                let m, S = 0,
                    E = 0;
                const x = l[M],
                    I = y === 0 && !u ? 0 : c / x,
                    G = f ? V : 0,
                    C = u ? Math.ceil(d) : d,
                    H = u && C % 2 === 1,
                    B = u && C % 2 === 0;
                if (P <= 0)
                    if (u && d > 1) {
                        if (P <= 0 && P >= -(C - 2) && (S = V, m = 1, E = 1), H && P < -(C - Math.ceil(C / 2))) {
                            const A = Math.ceil(C / 2) - Math.abs(P);
                            m = A, E = m ** 4, S = V + x * (1 - A) * (1 + I * 2)
                        }
                        if (B && P < -(C / 2 - 1) && P >= -(C / 2)) {
                            const A = C / 2 - Math.abs(P);
                            m = g - I + (v + I * 2) * (C / 2 - Math.abs(P)), E = ((m - g) / (1 - g)) ** 4, S = V + x * (v + I) * (1 - A)
                        }
                        if (B && P < -C / 2) {
                            let A = C / 2 + 1 - Math.abs(P);
                            m = 0, A >= 0 && (A = -I * 2 + A * (1 + I * 2), A = Math.max(Math.min(A, 1), 0), m = (y - I) * A), S = V + x * (v + I) * (2 - A) + x * (y - I) * (1 - A)
                        }
                    } else m = 1 + P, S = -O, E = m ** 4;
                if (d === 1) P > 0 && (m = 1 - P, S = -O + a * Math.min(P, 1), E = m ** 4);
                else {
                    if (P > 0 && P <= d - 2 && (S = V, m = 1, E = 1), B ? P > C / 2 - 1 && P <= C / 2 : P > C - 2 && P <= C - 1) {
                        const z = B ? Math.floor(C / 2) : 1;
                        m = g - I + (v + I * 2) * (C - z - Math.abs(P)), S = V, g === 1 ? E = m ** 4 : E = ((m - g) / (1 - g)) ** 4
                    }
                    if (H && P > d - Math.ceil(d / 2)) {
                        const z = Math.ceil(d / 2) - (d - Math.abs(P));
                        S = V - x * (I * 2) * z, m = 1 - z, E = m ** 4
                    }
                    if (P > d - 1 && P <= d && !u) {
                        const z = d - Math.abs(P),
                            R = g - I,
                            j = y - I;
                        m = j + (R - j) * z, S = V - x * (y + I) * (1 - z), y === 0 && (E = m ** 4)
                    }
                    if (P > (u ? C / 2 : C) && !H) {
                        let z = (u ? C / 2 + 1 : C + 1) - Math.abs(P),
                            R = 0;
                        m = 0, z >= 0 && (z = -I * 2 + z * (1 + I * 2), z = Math.max(Math.min(z, 1), 0), m = (y - I) * z, R = -z * (y + I) * x + z * c * (h ? 2 : 1)), S = -O + a * Math.min(P, 1) + R, E = 0
                    }
                }
                m < 0 && (m = 0), m > 1 && (m = 1), m === 0 && (m = 1e-5), w.style.setProperty("--swiper-material-scale", m), b.forEach(A => {
                    A.style.opacity = E
                }), L.forEach(A => {
                    let z = parseFloat(A.getAttribute("data-swiper-material-scale"));
                    (Number.isNaN(z) || !z && z !== 0) && (z = 1), A.style.transform = `scale(${1+(z-1)*(1-m)})`
                }), t.isHorizontal() ? (T.style.width = `${100*m}%`, T.style.transform = `translate3d(${S-G}px, 0, 0)`) : (T.style.height = `${100*m}%`, T.style.transform = `translate3d(0, ${S-G}px, 0)`)
            }
        },
        n = r => {
            const {
                slides: l
            } = t, o = [];
            for (let a = 0; a < l.length; a += 1) {
                const d = l[a],
                    c = d.querySelector(".swiper-material-wrapper"),
                    f = d.querySelectorAll(".swiper-material-animate-opacity"),
                    u = d.querySelectorAll("[data-swiper-material-scale]");
                [c, ...u, ...f].forEach(p => {
                    p.style.transitionDuration = `${r}ms`
                }), o.push(c)
            }
            Rt({
                swiper: t,
                duration: r,
                transformElements: o,
                allSlides: !0
            })
        };
    e("beforeInit", () => {
        if (t.params.effect !== "material") return;
        t.classNames.push(`${t.params.containerModifierClass}material`), t.isElement && t.hostEl && t.hostEl.classList.add(`swiper-${t.params.direction}`);
        const r = {
            loopAdditionalSlides: 1,
            watchSlidesProgress: !0,
            virtualTranslate: !t.params.cssMode
        };
        Object.assign(t.params, r), Object.assign(t.originalParams, r)
    }), e("setTranslate", () => {
        t.params.effect === "material" && s()
    }), e("setTransition", (r, l) => {
        t.params.effect === "material" && n(l)
    }), e("slidesUpdated", () => {
        if (!t.params.centeredSlides && t.params.slidesPerView > 1 && !t.params.loop && t.params.materialEffect.slideSplitRatio < 1) {
            const r = t.snapGrid[t.snapGrid.length - 1];
            t.snapGrid.push(r + t.slidesSizesGrid[0] + t.params.spaceBetween)
        }
        t.__preventObserver__ = !0, t.el.style.setProperty("--swiper-material-slide-size", `${t.slidesSizesGrid[0]}px`), requestAnimationFrame(() => {
            t.__preventObserver__ = !1
        })
    })
}
const J = new F(".swiper", {
        modules: [$t],
        effect: "material",
        materialEffect: {
            slideSplitRatio: .65
        },
        autoplay: {
            delay: 1000,
            disableOnInteraction: 0,
        },
        grabCursor: !0,
        slidesPerView: 1,
        spaceBetween: 16,
        speed: 600,
        breakpoints: {
        649:{
            slidesPerView: 2, // 1 slide on small screens
            spaceBetween: 16,
        },
    },
    }),
    W = document.querySelector(".dropdown"),
    Ht = document.querySelector("input");
W.parentElement.addEventListener("click", t => {
    W.contains(t.target) || W.classList.toggle("visible")
});
W.addEventListener("click", t => {
    const e = parseInt(t.target.getAttribute("data-value"), 10);
    J.params.slidesPerView = e, J.update(), W.classList.remove("visible"), document.querySelector(".spv").textContent = e
});
Ht.addEventListener("change", t => {
    const e = t.target.checked;
    J.params.centeredSlides = e, J.update()
});