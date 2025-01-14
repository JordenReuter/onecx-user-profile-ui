import { CommonModule, Location } from '@angular/common'
import { HttpClient } from '@angular/common/http'
import { Component, Inject, Input, OnInit } from '@angular/core'
import { RouterModule } from '@angular/router'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import {
  AngularRemoteComponentsModule,
  BASE_URL,
  RemoteComponentConfig,
  ocxRemoteComponent,
  ocxRemoteWebcomponent,
  provideTranslateServiceForRoot
} from '@onecx/angular-remote-components'
import {
  PortalCoreModule,
  REMOTE_COMPONENT_ID,
  createRemoteComponentTranslateLoader
} from '@onecx/portal-integration-angular'
import { SharedModule } from 'primeng/api'
import { Observable, ReplaySubject, of } from 'rxjs'
import { SharedModule as SharedModuleUserProfile } from '../shared/shared.module'
import { Configuration, RefType, UserAvatarAPIService } from '../shared/generated'
import { bffImageUrl } from '../shared/utils'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-avatar-image',
  standalone: true,
  templateUrl: './avatar-image.component.html',
  styleUrls: ['./avatar-image.component.scss'],
  providers: [
    {
      provide: BASE_URL,
      useValue: new ReplaySubject<string>(1)
    },
    {
      provide: REMOTE_COMPONENT_ID,
      useValue: 'ocx-avatar-image-component'
    },
    provideTranslateServiceForRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: createRemoteComponentTranslateLoader,
        deps: [HttpClient, BASE_URL, REMOTE_COMPONENT_ID]
      }
    })
  ],
  imports: [
    AngularRemoteComponentsModule,
    CommonModule,
    PortalCoreModule,
    RouterModule,
    TranslateModule,
    SharedModule,
    SharedModuleUserProfile
  ]
})
export class OneCXAvatarImageComponent implements ocxRemoteComponent, ocxRemoteWebcomponent, OnInit {
  imagePath$: Observable<string> | undefined
  public placeHolderPath: string = ''

  constructor(@Inject(BASE_URL) private baseUrl: ReplaySubject<string>, private avatarService: UserAvatarAPIService) {}

  @Input() set ocxRemoteComponentConfig(config: RemoteComponentConfig) {
    this.ocxInitRemoteComponent(config)
  }

  ocxInitRemoteComponent(remoteComponentConfig: RemoteComponentConfig) {
    this.baseUrl.next(remoteComponentConfig.baseUrl)
    this.placeHolderPath = Location.joinWithSlash(remoteComponentConfig.baseUrl, environment.DEFAULT_LOGO_PATH)
    this.avatarService.configuration = new Configuration({
      basePath: Location.joinWithSlash(remoteComponentConfig.baseUrl, environment.apiPrefix)
    })
  }

  ngOnInit(): void {
    // imagePath$ is an observable on purpose, so this component can be easily extended to
    // also display avatars of other user where a call the bff is needed to get the url
    // To do this, call the bff here and set the observable as imagePath$ here
    this.imagePath$ = of(
      bffImageUrl(this.avatarService.configuration.basePath, 'avatar', RefType.Small) ?? this.placeHolderPath
    )
  }

  public onImageError(): void {
    console.log('TEST###########', this.placeHolderPath)
    this.imagePath$ = of(this.placeHolderPath)
  }
}
