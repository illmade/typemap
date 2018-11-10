import { Point2D } from "../geom/point2d";

export abstract class MouseController {

    mousePosition(event: MouseEvent, within: HTMLElement): Point2D {
        let m_posx = event.clientX + document.body.scrollLeft
                 + document.documentElement.scrollLeft;
        let m_posy = event.clientY + document.body.scrollTop
                 + document.documentElement.scrollTop;

        var e_posx = 0;
        var e_posy = 0;

        if (within.offsetParent){
            do { 
                e_posx += within.offsetLeft;
                e_posy += within.offsetTop;
            } while (within = <HTMLElement>within.offsetParent);
        }

        return new Point2D(m_posx - e_posx, m_posy - e_posy);
    }

}
