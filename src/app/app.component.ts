import {Component, OnInit} from '@angular/core';
import AWSAppSyncClient, {AWSAppSyncClientOptions} from 'aws-appsync';
import {default as randomQuery} from './query.gql';
import {default as randomMutation} from './mutation.gql';
import {FormGroup, FormControl} from '@angular/forms';
import options from './options';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'sample-appsync';
  errorMessage: string;
  loading = false;

  form: FormGroup = new FormGroup({
    code: new FormControl(),
    mode: new FormControl(),
  });

  options = options;

  ngOnInit(): void {
    this.form.get('mode').setValue('mutation');
  }

  submit(): void {
    this.query(this.form.get('mode').value, this.form.get('code').value);
  }

  query(mode: 'query' | 'mutation', code: number): void {

    this.loading = true;
    this.errorMessage = null;
    const args = {
      url: '/graphql/' + code,
      region: 'ap-northeast-1',
      auth: {
        type: 'OPENID_CONNECT',
        jwtToken: async () => '1234'
      },
      offlineConfig: {
        keyPrefix: Math.random().toString()
      }
    } as AWSAppSyncClientOptions;
    const theClient = new AWSAppSyncClient(args);

    theClient.hydrated().then(async (client: AWSAppSyncClient<any>) => {
      if (mode === 'query') {
        return client.query({
          query: randomQuery
        });
      }
      return client.mutate({
        mutation: randomMutation
      });
    }).then(r => this.loading = false).catch(err => {
      console.error('Caught', err.message);
      this.loading = false;
      // Do sth to recover the error
      this.errorMessage = err.message;
    });
  }
}
