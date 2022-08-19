import {Directive, Inject} from '@angular/core';
import {Observable} from 'rxjs';
import { IntersectionObserveeService},from './intersection-observee.service';

// @dynamic
@Directive({
    selector: '[waIntersectionObservee]',
    outputs: ['waIntersectionObservee'],
    providers: [IntersectionObserveeService],
})
export class IntersectionObserveeDirective {
    constructor(
        @Inject(IntersectionObserveeService)
        readonly waIntersectionObservee: Observable<IntersectionObserverEntry[]>,
    ) {}
}