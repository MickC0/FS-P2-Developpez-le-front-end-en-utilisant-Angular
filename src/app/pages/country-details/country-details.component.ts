import {Component, HostListener, OnInit} from '@angular/core';
import {Olympic} from "../../core/models/Olympic";
import {LineChartModule, ScaleType} from "@swimlane/ngx-charts";
import {ActivatedRoute, Router} from "@angular/router";
import {OlympicService} from "../../core/services/olympic.service";
import {Subscription} from "rxjs";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-country-details',
  imports: [
    LineChartModule,
    NgIf
  ],
  templateUrl: './country-details.component.html',
  styleUrl: './country-details.component.scss'
})
export class CountryDetailsComponent implements OnInit{
  private sub!: Subscription;
  countryName!: string;
  countryData!: Olympic;

  totalEntries = 0;
  totalMedals = 0;
  totalAthletes = 0;

  lineChartData: any[] = [];
  view: [number, number] = [700, 400];
  colorScheme = {
    domain: ['#793D52'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'singleSeries'
  };
  legend = false;
  showXAxis = true;
  showYAxis = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Years';
  yAxisLabel = 'Medals';
  public errorMessage: string | null = null;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private olympicService: OlympicService
  ) {}

  ngOnInit(): void {
    this.setChartSize();
    this.countryName = this.route.snapshot.paramMap.get('countryName') || '';
    this.sub = this.olympicService.getOlympics().subscribe({
      next: (olympics: Olympic[]) => {
        const found = olympics.find(o => o.country === this.countryName);
        if (!found) {
          this.errorMessage = "Données introuvables pour ce pays. Redirection...";
          setTimeout(() => {
            this.router.navigate(['/not-found']);
          }, 3000);
          return;
        }
        this.countryData = found;
        this.totalEntries = found.participations.length;
        this.totalMedals = found.participations.reduce((acc, p) => acc + p.medalsCount, 0);
        this.totalAthletes = found.participations.reduce((acc, p) => acc + p.athleteCount, 0);

        this.lineChartData = [
          {
            name: this.countryName,
            series: found.participations.map(part => ({
              name: part.year.toString(),
              value: part.medalsCount
            }))
          }
        ];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données', error);
        this.errorMessage = "Impossible de charger les données.";
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
  goBack(): void {
    this.router.navigate(['/home']);
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
