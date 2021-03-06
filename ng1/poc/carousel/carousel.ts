namespace poc {
    'use strict';  
    const _defaultAnimiationDuration = 1000;
    const _slideWidth = 1000;

    angular.module('poc').directive('carousel', ['$animate', '$timeout', ($animate, $timeout) => new CarouselDirective($animate, $timeout)]);

    class CarouselDirective implements ng.IDirective {
        public link: ($scope: ICarouselScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => void;
        public restrict = 'EA';
        public scope = {
            options: '=?carousel'
        };
        public template = `
<div class="carousel">
    <button type="button" class="previous" ng-click="slideAnimationInProgress || onPreviousClick()">
        <i class="fa-angle-left"></i>
    </button>
    <div class="slides"
         ng-style="{ width: slidesWidth }">
        <div class="slide"
             ng-repeat="slide in slides track by $index"
             ng-style="{ background: slide.background }"></div>
    </div>
    <div class="pager">
        <button type="button"
                class="item"
                title="item.title"
                ng-click="slideAnimationInProgress || onPagerItemClick($index)"
                ng-repeat="item in options.items">
            <i ng-class="{'fa-circle': $index === currentPagerItemIndex, 'fa-circle-o': $index !== currentPagerItemIndex}"></i>
        </button>
    </div>
    <button type="button" class="next" ng-click="slideAnimationInProgress || onNextClick()">
        <i class="fa-angle-right"></i>
    </button>
</div>
        `;

        constructor(public $animate: ng.animate.IAnimateService, public $timeout: ng.ITimeoutService) {
            const self: CarouselDirective = this;

            self.link = self.unboundLink.bind(self);
        }

        unboundLink($scope: ICarouselScope, $element: ng.IAugmentedJQuery, attrs: ng.IAttributes) {
            const self: CarouselDirective = this;
            const slidesJqueryElement = $element.find('.slides').first();

            $scope.onNextClick = onNextClick;
            $scope.onPagerItemClick = onPagerItemClick;
            $scope.onPreviousClick = onPreviousClick;

            if (!$scope.options) {
                $scope.options = getStubOptions();
            }
            createSlides();
            moveToSecondSlide(false);

            function createSlides() {
                const items = $scope.options.items;
                const slides: Array<ICarouselItem> = [];
                const totalItemCount = items.length;

                // Create a "clone"" of the last slide and use it, as first slide, to prevent flikkering, when cycling the carousel. 
                slides.unshift(items[totalItemCount - 1]);
                for(let i = 0, length = totalItemCount; i < length; i++) {
                    slides.push(items[i]);
                }
                // Create a "clone" of the first slide and use it, as last slide, to prevent flikkering, when cycling the carousel.
                slides.push(items[0]);
                $scope.slidesWidth = `${slides.length * _slideWidth}px`;
                $scope.slides = slides;
            }

            function move(direction: Direction) {
                const total = $scope.slides.length;
                const incrementor = (direction === Direction.forward) ? 1 : -1;

                const firstPagerItemIndex = (direction === Direction.forward) ? 0 : total - 3;
                const lastPagerItemIndex = (direction === Direction.forward) ? total - 3 : 0;
                setPagerItemIndex(firstPagerItemIndex, lastPagerItemIndex, incrementor);

                const firstSlideIndex = (direction === Direction.forward) ? 0 : total - 1;
                const lastSlideIndex = (direction === Direction.forward) ? total - 1 : 0;
                setSlideIndexAndMove(firstSlideIndex, lastSlideIndex, incrementor);
            }

            function moveSlide(offset: number, duration?: number, cb?: Function) {
                const useAnimation = duration !== 0;
                duration = duration || _defaultAnimiationDuration;
                cb = cb || onSlideAnimationEnd;

                if(useAnimation) {
                    $scope.slideAnimationInProgress = true;
                    slidesJqueryElement.animate({ left: `${offset}px` }, duration,'swing', cb);
                } else {
                    slidesJqueryElement.css("left", `${offset}px`);
                }
            }

            function moveToSecondSlide(useAnimation: boolean) {
                const duration = useAnimation ? _defaultAnimiationDuration : 0;
                const total = $scope.slides.length;
                moveSlide(0 - (1  * _slideWidth), duration);
                $scope.currentPagerItemIndex = 0;
                $scope.currentSlideIndex = 1;
            }
            
            function onNextClick() {
                move(Direction.forward);
            }

            function onPagerItemClick(index: number) {
                $scope.currentPagerItemIndex = index;
                $scope.currentSlideIndex = index + 1;
                moveSlide(0 - ($scope.currentSlideIndex * _slideWidth));
            }

            function onPreviousClick() {
                move(Direction.backward);
            }

            function onSlideAnimationEnd() {
                $scope.slideAnimationInProgress = false;
            }
            
            function setPagerItemIndex(first: number, last: number, incrementor: number) {
                if($scope.currentPagerItemIndex === last) {
                    $scope.currentPagerItemIndex = first;
                } else {
                    $scope.currentPagerItemIndex = $scope.currentPagerItemIndex + incrementor;
                }
            }

            function setSlideIndexAndMove(first: number, last: number, incrementor: number) {
                if($scope.currentSlideIndex === last) {
                    $scope.currentSlideIndex = first + incrementor;
                    moveSlide(0 - ($scope.currentSlideIndex * _slideWidth), 0);
                    $scope.currentSlideIndex = $scope.currentSlideIndex  + incrementor;
                    moveSlide(0 - ($scope.currentSlideIndex * _slideWidth));
                } else {
                    $scope.currentSlideIndex = $scope.currentSlideIndex + incrementor;
                    moveSlide(0 - ($scope.currentSlideIndex * _slideWidth));
                }
            }
        }
    }

    enum Direction {
        backward = 0,
        forward = 1
    }

    interface ICarouselScope extends ng.IScope {
        currentPagerItemIndex: number;
        currentSlideIndex: number;
        onNextClick: () => void;
        onPagerItemClick: (index: number) => void;
        onPreviousClick: () => void;
        options: ICarouselOptions;
        slides: Array<ICarouselItem>;
        slideAnimationInProgress: boolean;
        slidesWidth: string;
    }

    interface ICarouselOptions {
        items: Array<ICarouselItem>;
    }

    interface ICarouselItem {
        background: string;
        title: string;
    }

    function getStubOptions(): ICarouselOptions {
        const items = [
                { title: 'title 1', background: 'url(/ng1/poc/carousel/img1_small.png)' },
                { title: 'title 2', background: 'url(/ng1/poc/carousel/img2_small.png)' },
                { title: 'title 3', background: 'url(/ng1/poc/carousel/img3_small.png)' }
            ];

        const options: ICarouselOptions = {
            items: items
        }
        return options;
    } 
}