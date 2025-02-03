import {Component, HostListener, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import {Color, PieChartModule, ScaleType} from "@swimlane/ngx-charts";
import {FaIconComponent, IconDefinition} from "@fortawesome/angular-fontawesome";
import { faMedal } from '@fortawesome/free-solid-svg-icons';
import {Olympic} from "../../core/models/Olympic";
import {Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    PieChartModule,
    FaIconComponent,
  ]
})
export class HomeComponent implements OnInit {
  private sub!: Subscription;

  public chartData: {name: string, value: number}[] = [];
  public view: [number, number] = [700, 400];
  public gradient = false;
  public labels = true;


  public colorScheme: Color = {
    domain: ['#793D52', '#89A1DA', '#9680A1', '#BEE0F1', '#B8CAE6', '#945F65'],
    name: 'ordinal',
    selectable: true,
    group: ScaleType.Ordinal,
  };

  public faMedal: IconDefinition = faMedal;

  public totalJOs = 0;
  public totalCountries = 0;

  constructor(
    private olympicService: OlympicService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setChartSize();
    this.sub = this.olympicService.getOlympics().subscribe({
      next: (olympics: Olympic[]) => {
        this.totalCountries = olympics.length;
        const allYears = new Set<number>();
        olympics.forEach(o => {
          o.participations.forEach(p => allYears.add(p.year));
        });
        this.totalJOs = allYears.size;

        this.chartData = olympics.map(olympic => {
          const totalMedals = olympic.participations.reduce(
            (acc, participation) => acc + participation.medalsCount,
            0
          );
          return { name: olympic.country, value: totalMedals };
        });
      },
      error: (error) => console.error('Erreur lors du chargement des données', error)
    });
  }
  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  onSelect(selectedItem: { name: string; value: number }) {
    this.router.navigate(['/detail', selectedItem.name]);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.setChartSize();
  }

  setChartSize() {
    const screenWidth = window.innerWidth;
    if (screenWidth < 600) {
      this.view = [screenWidth * 0.9, 300];
    } else {
      this.view = [700, 400];
    }
  }
}
